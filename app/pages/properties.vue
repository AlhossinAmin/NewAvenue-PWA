<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import {
  DUMMY_PROPERTIES,
  type Property,
  type PropertyStatus,
} from "~/constants/dummy/properties";

const properties = DUMMY_PROPERTIES;

const statusColor: Record<PropertyStatus, "success" | "warning" | "neutral"> = {
  Available: "success",
  Reserved: "warning",
  Sold: "neutral",
};

const columns: TableColumn<Property>[] = [
  { accessorKey: "unit_num", header: "Unit" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "compound", header: "Compound" },
  { accessorKey: "district", header: "Location" },
  { accessorKey: "area", header: "Area" },
  { accessorKey: "transaction_type", header: "Deal" },
  { accessorKey: "price", header: "Price" },
  { accessorKey: "status", header: "Status" },
];

const priceFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatPrice(value: number): string {
  return `EGP ${priceFormatter.format(value)}`;
}
</script>

<template>
  <ResourcePage
    panel-id="properties"
    title="Properties"
    icon="i-lucide-home"
    new-label="New property"
  >
    <!-- Mobile-first: card list on small screens -->
    <div class="flex flex-col gap-3 sm:hidden">
      <UCard v-for="p in properties" :key="p.id">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="truncate font-semibold">{{ p.compound }}</p>
            <p class="truncate text-sm text-muted">
              {{ p.type }} · Unit {{ p.unit_num }}
            </p>
          </div>
          <UBadge :color="statusColor[p.status]" variant="subtle" size="sm">
            {{ p.status }}
          </UBadge>
        </div>

        <div class="mt-3 flex flex-col gap-2 text-sm">
          <div class="flex items-center gap-1.5 text-muted">
            <UIcon name="i-lucide-map-pin" class="size-4 shrink-0" />
            <span class="truncate">{{ p.district }}, {{ p.city }}</span>
          </div>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted">
            <span v-if="p.num_bedrooms" class="flex items-center gap-1">
              <UIcon name="i-lucide-bed-double" class="size-4" />
              {{ p.num_bedrooms }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-bath" class="size-4" />
              {{ p.num_bathrooms }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-ruler" class="size-4" />
              {{ p.area }} m²
            </span>
          </div>

          <div class="flex items-center justify-between pt-1">
            <UBadge color="neutral" variant="soft" size="sm">
              {{ p.transaction_type }}
            </UBadge>
            <span class="font-semibold">{{ formatPrice(p.price) }}</span>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Table on larger screens -->
    <div class="hidden sm:block">
      <UTable :data="properties" :columns="columns">
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
          {{ formatPrice(row.original.price) }}
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="statusColor[row.original.status]" variant="subtle">
            {{ row.original.status }}
          </UBadge>
        </template>
      </UTable>
    </div>
  </ResourcePage>
</template>
