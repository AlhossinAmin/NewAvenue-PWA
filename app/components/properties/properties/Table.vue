<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <UInput
        v-model="searchInput"
        icon="i-lucide-search"
        class="flex-1"
        placeholder="Search properties…"
      />

      <!-- Filters: popover on desktop, bottom drawer on mobile -->
      <template v-if="filterFields.length">
        <div class="hidden sm:block">
          <UPopover :content="{ align: 'end' }">
            <UButton
              icon="i-lucide-list-filter"
              :label="filterButtonLabel"
              :color="activeFilterCount ? 'primary' : 'neutral'"
              :variant="activeFilterCount ? 'soft' : 'outline'"
            />
            <template #content>
              <div class="w-72 p-4">
                <DataViewFilters
                  :filters="resolvedFilters"
                  :values="filterValues"
                  :active-count="activeFilterCount"
                  @clear="clearFilters"
                />
              </div>
            </template>
          </UPopover>
        </div>

        <div class="sm:hidden">
          <UDrawer v-model:open="filterOpen" title="Filters">
            <UButton
              icon="i-lucide-list-filter"
              :label="filterButtonLabel"
              :color="activeFilterCount ? 'primary' : 'neutral'"
              :variant="activeFilterCount ? 'soft' : 'outline'"
            />
            <template #body>
              <DataViewFilters
                :filters="resolvedFilters"
                :values="filterValues"
                :active-count="activeFilterCount"
                @clear="clearFilters"
              />
            </template>
          </UDrawer>
        </div>
      </template>

      <!-- Mobile sort sheet -->
      <div class="sm:hidden">
        <UDrawer v-model:open="sortOpen" title="Sort">
          <UButton
            icon="i-lucide-arrow-up-down"
            color="neutral"
            variant="outline"
            square
            aria-label="Sort"
          />

          <template #body>
            <div class="flex flex-col gap-4 pb-4">
              <div class="flex gap-2">
                <UButton
                  label="Ascending"
                  icon="i-lucide-arrow-up"
                  block
                  :color="sortDir === 'asc' ? 'primary' : 'neutral'"
                  :variant="sortDir === 'asc' ? 'solid' : 'outline'"
                  @click="sortDir = 'asc'"
                />
                <UButton
                  label="Descending"
                  icon="i-lucide-arrow-down"
                  block
                  :color="sortDir === 'desc' ? 'primary' : 'neutral'"
                  :variant="sortDir === 'desc' ? 'solid' : 'outline'"
                  @click="sortDir = 'desc'"
                />
              </div>

              <div class="flex flex-col gap-1">
                <p class="px-1 text-xs font-medium text-muted">Sort by</p>
                <UButton
                  v-for="f in sortFields"
                  block
                  class="justify-between"
                  :key="f.key"
                  :label="f.label"
                  :color="sortKey === f.key ? 'primary' : 'neutral'"
                  :variant="sortKey === f.key ? 'soft' : 'ghost'"
                  :trailing-icon="
                    sortKey === f.key ? sortIcon(f.key) : undefined
                  "
                  @click="toggleSort(f.key)"
                />
                <UButton
                  v-if="sortKey"
                  label="Clear sort"
                  color="neutral"
                  variant="link"
                  block
                  @click="sortKey = null"
                />
              </div>
            </div>
          </template>
        </UDrawer>
      </div>
    </div>

    <!-- Mobile: card list -->
    <div class="flex flex-col gap-3 sm:hidden">
      <template v-if="loading">
        <div
          v-for="n in skeletonRows"
          class="rounded-lg border border-default p-4"
          :key="n"
        >
          <div class="flex items-center gap-3">
            <USkeleton class="size-10 shrink-0 rounded-full" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-1/2" />
              <USkeleton class="h-3 w-3/4" />
            </div>
          </div>
          <USkeleton class="mt-3 h-3 w-full" />
        </div>
      </template>
      <template v-else>
        <NuxtLink
          v-for="row in properties"
          class="block"
          :key="row.id"
          :to="`/properties/${row.id}`"
        >
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

              <div
                class="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted"
              >
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
                  {{ row.transaction_label }}
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
        </NuxtLink>
        <p
          v-if="!properties.length"
          class="py-12 text-center text-sm text-muted"
        >
          No results.
        </p>
      </template>
    </div>

    <!-- Desktop: table with sortable headers -->
    <div class="hidden sm:block">
      <UTable
        :data="loading ? skeletonData : properties"
        :columns="loading ? skeletonColumns : tableColumns"
      >
        <template #unit_num-cell="{ row }">
          <span class="font-medium">{{ row.original.unit_num }}</span>
        </template>

        <template #project-cell="{ row }">
          <ULink
            class="font-medium text-primary hover:underline"
            :to="`/projects/${row.original.project_id}`"
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
            {{ row.original.transaction_label }}
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

        <template #created_at-cell="{ row }">
          <span class="whitespace-nowrap text-muted">
            {{ row.original.created_at_label }}
          </span>
        </template>

        <template #updated_at-cell="{ row }">
          <span class="whitespace-nowrap text-muted">
            {{ row.original.updated_at_label }}
          </span>
        </template>
      </UTable>
    </div>

    <!-- Server-side pagination footer -->
    <div
      v-if="pagination && pagination.total > pagination.per_page"
      class="flex items-center justify-between gap-2"
    >
      <p class="text-sm text-muted">{{ pagination.total }} results</p>
      <UPagination
        v-model:page="page"
        :total="pagination.total"
        :items-per-page="pagination.per_page"
      />
    </div>
  </div>

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
          <span class="font-medium">{{ installmentSummary.value_label }}</span>
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
          <span class="font-medium">{{ installmentSummary.price_label }}</span>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { FilterField } from "~/composables/common/useTable";
import {
  TRANSACTION_TYPE_LABELS,
  type Property,
  type TransactionType,
} from "~/types/properties/properties";

// A property shaped into display-ready fields the table/cards read directly
// (no function calls in templates).
type PropertyRow = Property & {
  price_label: string;
  project_name: string;
  project_id: string;
  transaction_label: string;
  created_at_label: string;
  updated_at_label: string;
};

const priceFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const amountFormatter = new Intl.NumberFormat("en-US");
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

// Format an ISO timestamp into a short, readable date; blanks render as "—".
const formatDate = (value?: string) =>
  value ? dateFormatter.format(new Date(value)) : "—";

const columns: TableColumn<PropertyRow>[] = [
  { accessorKey: "unit_num", header: "Unit" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "project", header: "Project" },
  { accessorKey: "district", header: "Location" },
  { accessorKey: "area", header: "Area" },
  { accessorKey: "transaction_type", header: "Offering" },
  { accessorKey: "price", header: "Price" },
  { accessorKey: "installments", header: "Installments" },
  { accessorKey: "created_at", header: "Date created" },
  { accessorKey: "updated_at", header: "Last update" },
];

const SORT_FIELDS = [
  { key: "project", label: "Project" },
  { key: "type", label: "Type" },
  { key: "area", label: "Area" },
  { key: "price", label: "Price" },
  { key: "district", label: "Location" },
  { key: "transaction_type", label: "Offering type" },
  { key: "delivery_year", label: "Delivery year" },
  { key: "created_at", label: "Date created" },
  { key: "updated_at", label: "Last update" },
];

const editTo = (row: PropertyRow) => `/properties/${row.id}`;

const { fetchProperties, fetchPropertyFacets } = useProperties();

// Filter option lists + numeric bounds come from the server (the current page
// can't reveal every distinct value or the true min/max).
const { data: facets } = useAsyncData("property-facets", fetchPropertyFacets);

// Reactive array (not a computed) so the reference passed to useTable stays
// stable while its contents fill in once the server facets resolve — useTable's
// internal filter computeds iterate this array and track its mutations.
const filterFields = reactive<FilterField[]>([]);

watchEffect(() => {
  const f = facets.value;
  filterFields.splice(0, filterFields.length);
  if (!f) return;
  filterFields.push(
    { key: "category", label: "Category", options: f.category },
    { key: "type", label: "Type", options: f.type },
    {
      key: "transaction_type",
      label: "Offering",
      // Drive options from the API facet, but show the friendly label.
      options: f.transaction_type.map((value) => ({
        label: TRANSACTION_TYPE_LABELS[value as TransactionType] ?? value,
        value,
      })),
    },
    {
      key: "project",
      label: "Project",
      options: f.project.map((p) => ({ label: p.name, value: p.id })),
    },
    { key: "district", label: "Location", options: f.district },
    {
      key: "num_bedrooms",
      label: "Bedrooms",
      options: f.num_bedrooms.map(String),
    },
    {
      key: "area",
      label: "Area (m²)",
      type: "range" as const,
      min: f.area.min,
      max: f.area.max,
    },
    {
      key: "price",
      label: "Price (EGP)",
      type: "slider" as const,
      min: f.price.min,
      max: f.price.max,
    },
  );
});

const rows = ref<PropertyRow[]>([]);

const {
  page,
  search,
  searchInput,
  sortParam,
  sortKey,
  sortDir,
  sortFields,
  sortIcon,
  toggleSort,
  tableColumns,
  skeletonColumns,
  skeletonData,
  skeletonRows,
  filterValues,
  resolvedFilters,
  activeFilterCount,
  filterButtonLabel,
  clearFilters,
} = useTable<PropertyRow>({
  columns,
  sortFields: SORT_FIELDS,
  filterFields,
  editTo,
  initialSort: "-created_at",
  rows,
});

const filterOpen = ref(false);
const sortOpen = ref(false);

// Translate the filter values into request query params: multi-selects become
// repeated `key[]` params, ranges become `*_min` / `*_max`. Empty selections
// are omitted so they don't constrain the query.
const filterQuery = computed(() => {
  const v = filterValues.value;
  const query: Record<string, unknown> = {};
  const select = (key: string) => {
    const val = v[key];
    if (Array.isArray(val) && val.length) query[`${key}[]`] = val;
  };
  const range = (key: string, minKey: string, maxKey: string) => {
    const val = v[key];
    if (Array.isArray(val) || !val) return;
    if (val.min !== "") query[minKey] = val.min;
    if (val.max !== "") query[maxKey] = val.max;
  };
  select("category");
  select("type");
  select("transaction_type");
  select("project");
  select("district");
  select("num_bedrooms");
  range("area", "area_min", "area_max");
  range("price", "price_min", "price_max");
  return query;
});

const { data, status, refresh } = useAsyncData(
  "properties",
  () =>
    fetchProperties({
      page: page.value,
      search: search.value,
      sort: sortParam.value,
      filters: filterQuery.value,
    }),
  { watch: [page] },
);

// Searching, re-sorting, or changing a filter resets to the first page; if
// already there, refetch directly so the change still takes effect.
watch(
  [search, sortParam, filterValues],
  () => {
    if (page.value !== 1) page.value = 1;
    else refresh();
  },
  { deep: true },
);

const loading = computed(() => status.value === "pending");

const properties = computed<PropertyRow[]>(() =>
  (data.value?.data ?? []).map((p) => ({
    ...p,
    price_label: `EGP ${priceFormatter.format(p.price)}`,
    project_name: p.project?.name ?? "—",
    project_id: p.project?.id ?? "",
    transaction_label:
      TRANSACTION_TYPE_LABELS[p.transaction_type] ?? p.transaction_type,
    created_at_label: formatDate(p.created_at),
    updated_at_label: formatDate(p.updated_at),
  })),
);

// Keep the rows ref (passed to useTable for any row-derived filter options) in
// sync with the current page of shaped rows.
watch(properties, (value) => {
  rows.value = value;
});

const pagination = computed(() =>
  data.value && !Array.isArray(data.value.pagination)
    ? data.value.pagination
    : null,
);

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

const openInstallments = (row: PropertyRow) => {
  selected.value = row;
  installmentOpen.value = true;
};
</script>
