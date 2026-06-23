<template>
  <UForm
    class="flex flex-col gap-6"
    :schema="schema"
    :state="state"
    @submit="onSubmit"
  >
    <div class="flex flex-col gap-8">
      <PropertiesPropertiesFormClassification :state="state" />
      <PropertiesPropertiesFormUnit :state="state" :unit-num="unitNum" />
      <PropertiesPropertiesFormPricing :state="state" />
      <PropertiesPropertiesFormLocation :state="state" />
      <PropertiesPropertiesFormSpecifications :state="state" />
      <PropertiesPropertiesFormMedia :state="state" />
    </div>

    <div class="flex items-center justify-end gap-2">
      <UButton
        label="Cancel"
        color="neutral"
        variant="ghost"
        @click="$router.back()"
      />
      <UButton
        type="submit"
        icon="i-lucide-check"
        :label="submitLabel"
        :loading="loading"
      />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import * as z from "zod";
import type { PropertyInput } from "~/composables/properties/useProperties";
import type {
  Property,
  PropertyFormState,
} from "~/types/properties/properties";

const props = defineProps<{
  // Omit (or null) to create; pass a property to edit it.
  record?: Property | null;
}>();

const toast = useToast();
const { createProperty, updateProperty } = useProperties();

// Empty number inputs arrive as "" — normalise to "not provided" before validating.
const blankToUndefined = (v: unknown) =>
  v === "" || v === undefined || v === null ? undefined : v;
const optionalNumber = z.preprocess(blankToUndefined, z.number().optional());
const requiredNumber = (message: string) =>
  z.preprocess(blankToUndefined, z.number({ error: message }));

const schema = z
  .object({
    category: z.enum(["Residential", "Commercial"], {
      error: "Category is required",
    }),
    type: z.string().min(1, "Type is required"),
    transaction_type: z.enum(["Primary", "Resale", "Rent"], {
      error: "Offering type is required",
    }),
    project: z.string().optional(),
    seller_name: z.string().optional(),
    building_num: requiredNumber("Building number is required"),
    floor_num: requiredNumber("Floor number is required"),
    unit_number: requiredNumber("Unit number is required"),
    installments_available: z.boolean().optional(),
    num_installments: optionalNumber,
    installment_value: optionalNumber,
    price: requiredNumber("Price is required"),
    commission_scheme: optionalNumber,
    country: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    neighborhood: z.string().optional(),
    street: z.string().optional(),
    area: optionalNumber,
    built_up_area: optionalNumber,
    delivery_year: optionalNumber,
    num_bedrooms: optionalNumber,
    num_bathrooms: optionalNumber,
    amenities: z.array(z.string()).optional(),
    description: z.string().optional(),
  })
  // Project vs. seller name are mutually exclusive on the offering type: a
  // Primary unit needs a linked project, Resale/Rent needs a seller name.
  .refine((d) => !(d.transaction_type === "Primary" && !d.project), {
    path: ["project"],
    message: "Project is required",
  })
  .refine(
    (d) =>
      !(
        (d.transaction_type === "Resale" || d.transaction_type === "Rent") &&
        !d.seller_name
      ),
    { path: ["seller_name"], message: "Seller name is required" },
  );

// The API returns `project`/`developer` as { id, name } objects, but the form
// works with their UUIDs — seed them from `*.id`. `photos` holds { id, url }
// objects in state and is reshaped to media ids on submit.
const state = reactive<PropertyFormState>(
  props.record
    ? {
        ...props.record,
        project: props.record.project?.id ?? "",
        developer: props.record.developer?.id ?? "",
        installments_available: props.record.installments_available ?? false,
        amenities: props.record.amenities ?? [],
        photos: props.record.photos ?? [],
      }
    : {
        category: undefined,
        type: "",
        transaction_type: undefined,
        project: "",
        seller_name: "",
        building_num: undefined,
        floor_num: undefined,
        unit_number: undefined,
        installments_available: false,
        num_installments: undefined,
        installment_value: undefined,
        price: undefined,
        commission_scheme: undefined,
        country: "",
        city: "",
        district: "",
        neighborhood: "",
        street: "",
        area: undefined,
        built_up_area: undefined,
        delivery_year: undefined,
        num_bedrooms: undefined,
        num_bathrooms: undefined,
        amenities: [],
        photos: [],
      },
);
const loading = ref(false);

// Derived unit code, e.g. Duplex / Building 5 / Floor 2 / Unit 13 -> "D5-2-13".
// Stays "" until the three numeric parts are filled in.
const unitNum = computed(() => {
  const filled = (v: unknown) => v !== undefined && v !== null && v !== "";
  if (
    !filled(state.building_num) ||
    !filled(state.floor_num) ||
    !filled(state.unit_number)
  )
    return "";
  const prefix = state.type ? state.type[0]!.toUpperCase() : "";
  return `${prefix}${state.building_num}-${state.floor_num}-${state.unit_number}`;
});

const submitLabel = computed(() =>
  props.record ? "Save changes" : "Create property",
);

// Clear the hidden side of each mutually-exclusive pair so a stale value from a
// since-hidden field never gets submitted.
watch(
  () => state.transaction_type,
  (type) => {
    if (type === "Primary") state.seller_name = "";
    else state.project = "";
  },
);
watch(
  () => state.installments_available,
  (on) => {
    if (!on) {
      state.num_installments = undefined;
      state.installment_value = undefined;
    }
  },
);

const onSubmit = async () => {
  loading.value = true;
  // `photos` holds { id, url } objects in state; the API expects media ids.
  const payload = {
    ...state,
    unit_num: unitNum.value,
    photos: state.photos.map((photo) => photo.id),
  };
  try {
    if (props.record) {
      await updateProperty(props.record.id, payload as Partial<PropertyInput>);
      toast.add({ title: "Property updated", color: "success" });
    } else {
      await createProperty(payload as PropertyInput);
      toast.add({ title: "Property created", color: "success" });
    }
    navigateTo("/properties");
  } catch {
    toast.add({
      title: props.record
        ? "Failed to update property"
        : "Failed to create property",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};
</script>
