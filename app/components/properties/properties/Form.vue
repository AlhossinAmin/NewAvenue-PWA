<template>
  <UForm
    class="flex flex-col gap-6"
    :schema="schema"
    :state="state"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <UFormField label="Category" name="category" required>
        <USelect
          v-model="state.category"
          class="w-full"
          placeholder="Select…"
          :items="CATEGORY_OPTIONS"
        />
      </UFormField>

      <UFormField label="Type" name="type" required>
        <UInput
          v-model="state.type"
          class="w-full"
          placeholder="e.g. Apartment"
        />
      </UFormField>

      <UFormField label="Offering type" name="transaction_type" required>
        <USelect
          v-model="state.transaction_type"
          class="w-full"
          placeholder="Select…"
          :items="TRANSACTION_OPTIONS"
        />
      </UFormField>

      <!-- A Primary unit links to an actual developer project; Resale/Rent
           offerings have no linked project — an individual seller is named. -->
      <UFormField
        v-if="state.transaction_type === 'Primary'"
        label="Project"
        name="project"
        required
      >
        <PropertiesProjectsSelect v-model="state.project" />
      </UFormField>

      <UFormField
        v-else-if="
          state.transaction_type === 'Resale' ||
          state.transaction_type === 'Rent'
        "
        label="Seller name"
        name="seller_name"
        required
      >
        <UInput
          v-model="state.seller_name"
          class="w-full"
          placeholder="Seller name"
        />
      </UFormField>

      <!-- Unit identity: the three numeric parts plus the type feed the
           read-only "Unit" code below. -->
      <UFormField label="Building number" name="building_num" required>
        <UInput
          v-model.number="state.building_num"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Floor number" name="floor_num" required>
        <UInput v-model.number="state.floor_num" type="number" class="w-full" />
      </UFormField>

      <UFormField label="Unit number" name="unit_number" required>
        <UInput
          v-model.number="state.unit_number"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Unit" name="unit_num">
        <UInput
          readonly
          disabled
          placeholder="Auto-generated"
          class="w-full"
          :model-value="unitNum"
        />
      </UFormField>

      <UFormField
        label="Installments available"
        name="installments_available"
        class="sm:col-span-2"
      >
        <USwitch v-model="state.installments_available" />
      </UFormField>

      <template v-if="state.installments_available">
        <UFormField label="Number of installments" name="num_installments">
          <UInput
            v-model.number="state.num_installments"
            type="number"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Installment value (EGP)" name="installment_value">
          <UInput
            v-model.number="state.installment_value"
            type="number"
            class="w-full"
          />
        </UFormField>
      </template>

      <UFormField label="Price (EGP)" name="price" required>
        <UInput v-model.number="state.price" type="number" class="w-full" />
      </UFormField>

      <UFormField label="Commission (%)" name="commission_scheme">
        <UInput
          v-model.number="state.commission_scheme"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Country" name="country">
        <UInput v-model="state.country" class="w-full" placeholder="Country" />
      </UFormField>

      <UFormField label="City" name="city">
        <UInput v-model="state.city" class="w-full" placeholder="City" />
      </UFormField>

      <UFormField label="District" name="district">
        <ComboboxInput v-model="state.district" :options="DISTRICT_OPTIONS" />
      </UFormField>

      <UFormField label="Neighborhood" name="neighborhood">
        <UInput
          v-model="state.neighborhood"
          class="w-full"
          placeholder="Neighborhood"
        />
      </UFormField>

      <UFormField label="Street" name="street">
        <UInput v-model="state.street" class="w-full" placeholder="Street" />
      </UFormField>

      <UFormField label="Total area (m²)" name="area">
        <UInput v-model.number="state.area" type="number" class="w-full" />
      </UFormField>

      <UFormField label="Built-up area (m²)" name="built_up_area">
        <UInput
          v-model.number="state.built_up_area"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Delivery year" name="delivery_year">
        <UInput
          v-model.number="state.delivery_year"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Bedrooms" name="num_bedrooms">
        <UInput
          v-model.number="state.num_bedrooms"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Bathrooms" name="num_bathrooms">
        <UInput
          v-model.number="state.num_bathrooms"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Amenities" name="amenities" class="sm:col-span-2">
        <UInputTags
          v-model="state.amenities"
          class="w-full"
          placeholder="Add amenity and press enter"
        />
      </UFormField>

      <UFormField
        label="Featured photo"
        name="featured_photo"
        class="sm:col-span-2"
      >
        <ImageInput v-model="state.featured_photo" label="Featured photo" />
      </UFormField>

      <UFormField label="Photos" name="photos" class="sm:col-span-2">
        <PhotosInput v-model="state.photos" label="Photos" />
      </UFormField>

      <UFormField label="Description" name="description" class="sm:col-span-2">
        <UTextarea
          v-model="state.description"
          class="w-full"
          placeholder="Short description"
          :rows="3"
        />
      </UFormField>
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
import { DISTRICT_OPTIONS } from "~/constants/common/forms";
import type { PropertyInput } from "~/composables/properties/useProperties";
import type {
  Property,
  PropertyCategory,
  TransactionType,
} from "~/types/properties/properties";
import type { MediaItem } from "~/types/common/media";

const props = defineProps<{
  // Omit (or null) to create; pass a property to edit it.
  record?: Property | null;
}>();

const toast = useToast();
const { createProperty, updateProperty } = useProperties();

const CATEGORY_OPTIONS: PropertyCategory[] = ["Residential", "Commercial"];
const TRANSACTION_OPTIONS: TransactionType[] = ["Primary", "Resale", "Rent"];

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
    featured_photo: z.string().optional(),
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
const state = reactive<{
  category?: PropertyCategory;
  type: string;
  transaction_type?: TransactionType;
  project: string;
  seller_name: string;
  developer?: string;
  building_num?: number;
  floor_num?: number;
  unit_number?: number;
  installments_available: boolean;
  num_installments?: number;
  installment_value?: number;
  price?: number;
  commission_scheme?: number;
  country: string;
  city: string;
  district: string;
  // Not on the `Property` read type — form-only inputs, so optional here.
  neighborhood?: string;
  street: string;
  area?: number;
  built_up_area?: number;
  delivery_year?: number;
  num_bedrooms?: number;
  num_bathrooms?: number;
  amenities: string[];
  featured_photo: string;
  photos: MediaItem[];
  description: string;
}>(
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
        featured_photo: "",
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
