<template>
  <FormPage panel-id="properties-edit" back-to="/properties" :title="title">
    <template v-if="record && !isEditing" #actions>
      <UButton icon="i-lucide-pencil" label="Edit" @click="isEditing = true" />
    </template>

    <div
      v-if="!record"
      class="flex flex-col items-center gap-3 py-16 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-10 text-dimmed" />
      <p class="text-sm text-muted">This property does not exist.</p>
      <UButton label="Back to properties" to="/properties" />
    </div>

    <PropertiesPropertiesForm
      v-else-if="isEditing"
      :record="record"
      @saved="onSaved"
      @cancel="isEditing = false"
    />

    <div v-else class="flex flex-col gap-8">
      <ResourceView :fields="PROPERTY_VIEW_FIELDS" :record="viewRecord" />

      <section class="flex flex-col gap-3">
        <h2 class="text-sm font-semibold text-highlighted">
          Publications ({{ publications.length }})
        </h2>
        <p v-if="!publications.length" class="text-sm text-muted">
          Not published anywhere yet.
        </p>
        <UCard
          v-for="(pub, i) in publications"
          :key="i"
          :ui="{ body: 'sm:p-4' }"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex min-w-0 items-center gap-2">
              <UIcon class="size-4 shrink-0 text-muted" :name="pub.icon" />
              <div class="min-w-0">
                <p class="truncate font-medium">{{ pub.type_label }}</p>
                <ULink
                  v-if="pub.link"
                  class="truncate text-sm text-primary hover:underline"
                  target="_blank"
                  :to="pub.link"
                >
                  {{ pub.link }}
                </ULink>
                <p v-else class="text-sm text-dimmed">No link</p>
              </div>
            </div>
            <UBadge variant="subtle" size="sm" :color="pub.status_color">
              {{ pub.status_label }}
            </UBadge>
          </div>
        </UCard>
      </section>
    </div>
  </FormPage>
</template>

<script setup lang="ts">
import type { FormField } from "~/constants/common/forms";
import {
  TRANSACTION_TYPE_LABELS,
  ORIENTATION_LABELS,
  FINISHING_LABELS,
  FURNISHING_LABELS,
  PUBLICATION_TYPE_LABELS,
  PUBLICATION_TYPE_ICONS,
  PUBLICATION_STATUS_LABELS,
  PUBLICATION_STATUS_COLORS,
} from "~/types/properties/properties";

const route = useRoute();

const id = route.params.id as string;
const { fetchProperty } = useProperties();

const { data: record, refresh } = await useAsyncData(`property-${id}`, () =>
  fetchProperty(id).catch(() => null),
);

const isEditing = ref(false);

const title = computed(() =>
  record.value
    ? isEditing.value
      ? "Edit property"
      : "Property details"
    : "Property not found",
);

const onSaved = async () => {
  await refresh();
  isEditing.value = false;
};

// View-only display spec. Enum slugs (offering/orientation/finishing/furnishing)
// are pre-mapped to their human labels in `viewRecord`, so they render as plain
// text; relations (project/developer/seller) render their `.name`.
const PROPERTY_VIEW_FIELDS: FormField[] = [
  { key: "type", label: "Type", type: "text" },
  { key: "category", label: "Category", type: "text" },
  { key: "transaction_type", label: "Offering", type: "text" },
  { key: "unit_num", label: "Unit code", type: "text" },
  { key: "project", label: "Project", type: "project" },
  { key: "developer", label: "Developer", type: "developer" },
  { key: "seller", label: "Seller", type: "contact" },
  { key: "price", label: "Price (EGP)", type: "number" },
  { key: "commission_scheme", label: "Commission (%)", type: "number" },
  { key: "installments_available", label: "Installments", type: "switch" },
  { key: "num_installments", label: "No. of installments", type: "number" },
  { key: "installment_value", label: "Installment value", type: "number" },
  { key: "down_payment", label: "Down payment", type: "number" },
  { key: "remaining_value", label: "Remaining value", type: "number" },
  { key: "country", label: "Country", type: "text" },
  { key: "city", label: "City", type: "text" },
  { key: "district", label: "District", type: "text" },
  { key: "street", label: "Street", type: "text" },
  { key: "area", label: "Area (m²)", type: "number" },
  { key: "num_bedrooms", label: "Bedrooms", type: "number" },
  { key: "num_bathrooms", label: "Bathrooms", type: "number" },
  { key: "ready_to_move", label: "Ready to move", type: "switch" },
  { key: "delivery_date", label: "Delivery date", type: "date" },
  { key: "orientation", label: "Orientation", type: "text" },
  { key: "finishing", label: "Finishing", type: "text" },
  { key: "furnishing", label: "Furnishing", type: "text" },
  { key: "amenities", label: "Amenities", type: "tags" },
  { key: "description", label: "Description", type: "textarea", full: true },
  { key: "photos", label: "Photos", type: "photos", full: true },
];

// Override enum slugs with their human labels so the read-only view shows
// "For Sale" / "Bahary (North)" instead of the raw "sell" / "bahary".
const viewRecord = computed(() => {
  const r = record.value;
  if (!r) return {};
  return {
    ...r,
    transaction_type: r.transaction_type
      ? TRANSACTION_TYPE_LABELS[r.transaction_type]
      : "",
    orientation: r.orientation ? ORIENTATION_LABELS[r.orientation] : "",
    finishing: r.finishing ? FINISHING_LABELS[r.finishing] : "",
    furnishing: r.furnishing ? FURNISHING_LABELS[r.furnishing] : "",
  };
});

// Publications shaped into display-ready rows (label, icon, status badge).
const publications = computed(() =>
  (record.value?.publications ?? []).map((pub) => ({
    type_label: PUBLICATION_TYPE_LABELS[pub.type],
    icon: PUBLICATION_TYPE_ICONS[pub.type],
    status_label: PUBLICATION_STATUS_LABELS[pub.status],
    status_color: PUBLICATION_STATUS_COLORS[pub.status],
    link: pub.link,
  })),
);
</script>
