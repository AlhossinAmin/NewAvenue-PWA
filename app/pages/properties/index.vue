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
          <div class="min-w-0">
            <p class="truncate font-semibold">{{ row.project_name }}</p>
            <p class="truncate text-sm text-muted">
              {{ row.type }} · Unit {{ row.unit_num }}
            </p>
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

            <UButton
              v-if="row.installments_available"
              label="View installment plan"
              icon="i-lucide-wallet"
              color="neutral"
              variant="soft"
              size="xs"
              block
              @click.stop.prevent="openInstallments(row)"
            />
          </div>
        </UCard>
      </template>

      <template #unit_num-cell="{ row }">
        <span class="font-medium">{{ row.original.unit_num }}</span>
      </template>

      <template #project_name-cell="{ row }">
        <ULink
          :to="`/projects/${row.original.project}`"
          class="font-medium text-primary hover:underline"
        >
          {{ row.original.project_name }}
        </ULink>
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

      <template #installments-cell="{ row }">
        <UButton
          v-if="row.original.installments_available"
          label="View plan"
          icon="i-lucide-wallet"
          color="neutral"
          variant="soft"
          size="xs"
          @click="openInstallments(row.original)"
        />
        <span v-else class="text-muted">—</span>
      </template>
    </DataView>

    <UModal v-model:open="installmentOpen" title="Installment plan">
      <template #body>
        <div v-if="installmentSummary" class="flex flex-col gap-3">
          <p class="text-sm font-medium">
            {{ installmentSummary.project_name }} · Unit
            {{ installmentSummary.unit_num }}
          </p>

          <div class="flex justify-between text-sm">
            <span class="text-muted">Number of installments</span>
            <span class="font-medium">{{ installmentSummary.count }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted">Installment value</span>
            <span class="font-medium">{{
              installmentSummary.value_label
            }}</span>
          </div>

          <USeparator />

          <div class="flex justify-between text-sm">
            <span class="text-muted">Total over plan</span>
            <span class="font-semibold">{{
              installmentSummary.total_label
            }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted">List price</span>
            <span class="font-medium">{{
              installmentSummary.price_label
            }}</span>
          </div>
        </div>
      </template>
    </UModal>
  </ResourcePage>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { DUMMY_PROPERTIES, type Property } from "~/constants/dummy/properties";
import { DUMMY_PROJECTS } from "~/constants/dummy/projects";

const priceFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const amountFormatter = new Intl.NumberFormat("en-US");

// Resolve a property's linked project id to its name for display/sorting.
const projectNameById = new Map(DUMMY_PROJECTS.map((p) => [p.id, p.name]));

type PropertyRow = Property & { price_label: string; project_name: string };

const properties: PropertyRow[] = DUMMY_PROPERTIES.map((p) => ({
  ...p,
  price_label: `EGP ${priceFormatter.format(p.price)}`,
  project_name: projectNameById.get(p.project) ?? "—",
}));

const installmentOpen = ref(false);
const selected = ref<PropertyRow | null>(null);

const installmentSummary = computed(() => {
  const p = selected.value;
  if (!p) return null;
  const count = p.num_installments ?? 0;
  const value = p.installment_value ?? 0;
  return {
    project_name: p.project_name,
    unit_num: p.unit_num,
    count,
    value_label: `EGP ${amountFormatter.format(value)}`,
    total_label: `EGP ${amountFormatter.format(count * value)}`,
    price_label: p.price_label,
  };
});

const columns: TableColumn<PropertyRow>[] = [
  { accessorKey: "unit_num", header: "Unit" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "project_name", header: "Project" },
  { accessorKey: "district", header: "Location" },
  { accessorKey: "area", header: "Area" },
  { accessorKey: "transaction_type", header: "Offering" },
  { accessorKey: "price", header: "Price" },
  { accessorKey: "installments", header: "Installments" },
];

const sortFields = [
  { key: "project_name", label: "Project" },
  { key: "type", label: "Type" },
  { key: "area", label: "Area" },
  { key: "price", label: "Price" },
  { key: "district", label: "Location" },
  { key: "transaction_type", label: "Offering type" },
  { key: "delivery_year", label: "Delivery year" },
];

// Filters. Select options are derived from the data; area and price are ranges.
const filterFields = [
  { key: "category", label: "Category" },
  { key: "type", label: "Type" },
  { key: "transaction_type", label: "Offering" },
  { key: "project_name", label: "Project" },
  { key: "district", label: "Location" },
  { key: "num_bedrooms", label: "Bedrooms" },
  { key: "area", label: "Area (m²)", type: "range" as const },
  { key: "price", label: "Price (EGP)", type: "slider" as const },
];

const openInstallments = (row: PropertyRow) => {
  selected.value = row;
  installmentOpen.value = true;
};
</script>
