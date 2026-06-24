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
      <PropertiesPropertiesFormCharacteristics :state="state" />
      <PropertiesPropertiesFormMedia :state="state" />
      <PropertiesPropertiesFormPublishing :state="state" />
    </div>

    <div class="flex items-center justify-end gap-2">
      <UButton
        label="Cancel"
        color="neutral"
        variant="ghost"
        @click="emit('cancel')"
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
import { PROPERTY_TYPES_BY_CATEGORY } from "~/constants/properties/property-types";

const props = defineProps<{
  // Omit (or null) to create; pass a property to edit it.
  record?: Property | null;
}>();

// Parent owns navigation (saved/cancel) so a detail page can toggle back to its
// read-only view in place. See contacts/Form.vue.
const emit = defineEmits<{ saved: []; cancel: [] }>();

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
    transaction_type: z.enum(["sell", "rent"], {
      error: "Offering type is required",
    }),
    project: z.string().optional(),
    seller: z.string().optional(),
    building_num: requiredNumber("Building number is required"),
    floor_num: requiredNumber("Floor number is required"),
    unit_number: requiredNumber("Unit number is required"),
    installments_available: z.boolean().optional(),
    num_installments: optionalNumber,
    installment_value: optionalNumber,
    down_payment: optionalNumber,
    remaining_value: optionalNumber,
    price: requiredNumber("Price is required"),
    commission_scheme: optionalNumber,
    country: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    neighborhood: z.string().optional(),
    street: z.string().optional(),
    area: optionalNumber,
    built_up_area: optionalNumber,
    ready_to_move: z.boolean().optional(),
    delivery_date: z.string().optional(),
    num_bedrooms: optionalNumber,
    num_bathrooms: optionalNumber,
    orientation: z
      .enum([
        "bahary",
        "kably",
        "sharky",
        "gharby",
        "bahary_sharky",
        "bahary_gharby",
        "kably_sharky",
        "kably_gharby",
      ])
      .optional(),
    finishing: z
      .enum(["core_shell", "semi_finished", "fully_finished"])
      .optional(),
    furnishing: z.enum(["furnished", "unfurnished"]).optional(),
    amenities: z.array(z.string()).optional(),
    description: z.string().optional(),
  })
  // A rental must be linked to a seller contact.
  .refine((d) => !(d.transaction_type === "rent" && !d.seller), {
    path: ["seller"],
    message: "A property for rent must be linked to a seller contact.",
  })
  // A sale must have a seller and/or a project — at least one, never neither.
  .refine((d) => !(d.transaction_type === "sell" && !d.seller && !d.project), {
    path: ["seller"],
    message: "A property for sale must have a seller or a project.",
  });

// The API returns `project`/`developer` as { id, name } objects, but the form
// works with their UUIDs — seed them from `*.id`. `photos` holds { id, url }
// objects in state and is reshaped to media ids on submit.
const state = reactive<PropertyFormState>(
  props.record
    ? {
        ...props.record,
        project: props.record.project?.id ?? "",
        developer: props.record.developer?.id ?? "",
        seller: props.record.seller?.id ?? "",
        installments_available: props.record.installments_available ?? false,
        ready_to_move: props.record.ready_to_move ?? false,
        amenities: props.record.amenities ?? [],
        photos: props.record.photos ?? [],
        // Clone each entry so editing rows doesn't mutate the source record.
        publications: (props.record.publications ?? []).map((p) => ({ ...p })),
      }
    : {
        category: undefined,
        type: "",
        transaction_type: undefined,
        project: "",
        seller: "",
        building_num: undefined,
        floor_num: undefined,
        unit_number: undefined,
        installments_available: false,
        num_installments: undefined,
        installment_value: undefined,
        down_payment: undefined,
        remaining_value: undefined,
        price: undefined,
        commission_scheme: undefined,
        country: "",
        city: "",
        district: "",
        neighborhood: "",
        street: "",
        area: undefined,
        built_up_area: undefined,
        ready_to_move: false,
        delivery_date: undefined,
        num_bedrooms: undefined,
        num_bathrooms: undefined,
        orientation: undefined,
        finishing: undefined,
        furnishing: undefined,
        amenities: [],
        photos: [],
        description: "",
        publications: [],
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

// A rental has no linked project — clear any project picked while it was a sale
// so a stale value can't be submitted once the project field is hidden.
watch(
  () => state.transaction_type,
  (type) => {
    if (type === "rent") state.project = "";
  },
);
// The type options depend on the category — drop a type that no longer belongs
// to the selected category so a stale, mismatched value can't be submitted.
watch(
  () => state.category,
  (category) => {
    if (
      category &&
      !PROPERTY_TYPES_BY_CATEGORY[category].includes(state.type)
    ) {
      state.type = "";
    }
    // Orientation is Residential-only — drop a stale value when the category
    // changes away from Residential so it can't be submitted.
    if (category !== "Residential") state.orientation = undefined;
  },
);
watch(
  () => state.installments_available,
  (on) => {
    if (!on) {
      state.num_installments = undefined;
      state.installment_value = undefined;
      state.down_payment = undefined;
      state.remaining_value = undefined;
    }
  },
);
// A ready-to-move unit has no future delivery date — clear it so a stale date
// can't be submitted once the picker is hidden.
watch(
  () => state.ready_to_move,
  (ready) => {
    if (ready) state.delivery_date = undefined;
  },
);

// Surface the first field message the API returns under `meta.error.stack`
// (e.g. the server's seller rule) so a 422 reads as something actionable
// instead of the generic fallback.
const serverErrorMessage = (error: unknown): string | undefined => {
  const stack = (
    error as {
      data?: { meta?: { error?: { stack?: Record<string, unknown> } } };
    }
  )?.data?.meta?.error?.stack;
  if (!stack) return undefined;
  for (const value of Object.values(stack)) {
    const message = Array.isArray(value) ? value[0] : value;
    if (typeof message === "string") return message;
  }
  return undefined;
};

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
    emit("saved");
  } catch (error) {
    const fallback = props.record
      ? "Failed to update property"
      : "Failed to create property";
    toast.add({
      title: serverErrorMessage(error) ?? fallback,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};
</script>
