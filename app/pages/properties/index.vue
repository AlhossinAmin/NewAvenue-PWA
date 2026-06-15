<template>
  <ResourcePage
    panel-id="properties"
    title="Properties"
    icon="i-lucide-home"
    new-label="New property"
    create-to="/properties/new"
  >
    <DataView
      :rows="properties"
      :columns="columns"
      :sort-fields="sortFields"
      :filter-fields="filterFields"
      search-placeholder="Search properties…"
      :edit-to="(row) => `/properties/${row.id}`"
    >
      <template #card="{ row }">
        <UCard>
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate font-semibold">{{ row.compound }}</p>
              <p class="truncate text-sm text-muted">
                {{ row.type }} · Unit {{ row.unit_num }}
              </p>
            </div>
            <UBadge :color="statusColor(row.status)" variant="subtle" size="sm">
              {{ row.status }}
            </UBadge>
          </div>

          <div class="mt-3 flex flex-col gap-2 text-sm">
            <div class="flex items-center gap-1.5 text-muted">
              <UIcon name="i-lucide-map-pin" class="size-4 shrink-0" />
              <span class="truncate">{{ row.district }}, {{ row.city }}</span>
            </div>

            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted">
              <span v-if="row.num_bedrooms" class="flex items-center gap-1">
                <UIcon name="i-lucide-bed-double" class="size-4" />
                {{ row.num_bedrooms }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-bath" class="size-4" />
                {{ row.num_bathrooms }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-ruler" class="size-4" />
                {{ row.area }} m²
              </span>
            </div>

            <div class="flex items-center justify-between pt-1">
              <UBadge color="neutral" variant="soft" size="sm">
                {{ row.transaction_type }}
              </UBadge>
              <span class="font-semibold">{{ row.price_label }}</span>
            </div>
          </div>
        </UCard>
      </template>

      <template #unit_num-cell="{ row }">
        <span class="font-medium">{{ row.original.unit_num }}</span>
      </template>

      <template #district-cell="{ row }">
        {{ row.original.district }}, {{ row.original.city }}
      </template>

      <template #area-cell="{ row }"> {{ row.original.area }} m² </template>

      <template #transaction_type-cell="{ row }">
        <UBadge color="neutral" variant="soft">
          {{ row.original.transaction_type }}
        </UBadge>
      </template>

      <template #price-cell="{ row }">
        {{ row.original.price_label }}
      </template>

      <template #status-cell="{ row }">
        <UBadge :color="statusColor(row.original.status)" variant="subtle">
          {{ row.original.status }}
        </UBadge>
      </template>
    </DataView>
  </ResourcePage>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import {
  DUMMY_PROPERTIES,
  type Property,
  type PropertyStatus,
} from "~/constants/dummy/properties";

const priceFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

type PropertyRow = Property & { price_label: string };

const properties: PropertyRow[] = DUMMY_PROPERTIES.map((p) => ({
  ...p,
  price_label: `EGP ${priceFormatter.format(p.price)}`,
}));

const STATUS_COLOR: Record<PropertyStatus, "success" | "warning" | "neutral"> =
  {
    Available: "success",
    Reserved: "warning",
    Sold: "neutral",
  };

function statusColor(status: PropertyStatus) {
  return STATUS_COLOR[status];
}

const columns: TableColumn<PropertyRow>[] = [
  { accessorKey: "unit_num", header: "Unit" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "compound", header: "Compound" },
  { accessorKey: "district", header: "Location" },
  { accessorKey: "area", header: "Area" },
  { accessorKey: "transaction_type", header: "Offering" },
  { accessorKey: "price", header: "Price" },
  { accessorKey: "status", header: "Status" },
];

const sortFields = [
  { key: "compound", label: "Compound" },
  { key: "type", label: "Type" },
  { key: "area", label: "Area" },
  { key: "price", label: "Price" },
  { key: "district", label: "Location" },
  { key: "transaction_type", label: "Offering type" },
  { key: "delivery_year", label: "Delivery year" },
  { key: "status", label: "Status" },
];

// Filters. Select options are derived from the data; area is a numeric range.
const filterFields = [
  { key: "status", label: "Status" },
  { key: "category", label: "Category" },
  { key: "type", label: "Type" },
  { key: "transaction_type", label: "Offering" },
  { key: "compound", label: "Compound" },
  { key: "district", label: "Location" },
  { key: "num_bedrooms", label: "Bedrooms" },
  { key: "area", label: "Area (m²)", type: "range" as const },
];
</script>
