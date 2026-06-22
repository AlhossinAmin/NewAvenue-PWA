<template>
  <ResourcePage
    panel-id="properties"
    title="Properties"
    icon="i-lucide-home"
    new-label="New property"
    create-to="/properties/new"
  >
    <DataView
      v-model:page="page"
      v-model:search="search"
      v-model:sort="sort"
      v-model:filters="filterState"
      server-side
      search-placeholder="Search properties…"
      :rows="properties"
      :columns="columns"
      :sort-fields="sortFields"
      :filter-fields="filterFields"
      :total="pagination?.total"
      :per-page="pagination?.per_page"
      :loading="status === 'pending'"
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
import type { Property } from "~/types/properties/properties";

type PropertyRow = Property & {
  price_label: string;
  project_name: string;
  project_id: string;
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

const { fetchProperties, fetchPropertyFacets } = useProperties();

const page = ref(1);
const search = ref("");
const sort = ref<string | null>("-created_at");

// Filter values, two-way bound to DataView. Keys map to `filterFields` below:
// select fields hold string[] (the chosen values/ids), range/slider fields hold
// { min, max } strings.
const filterState = ref<
  Record<string, string[] | { min: string; max: string }>
>({});

// Translate the filter values into request query params: multi-selects become
// repeated `key[]` params, ranges become `*_min` / `*_max`. Empty selections
// are omitted so they don't constrain the query.
const filterQuery = computed(() => {
  const v = filterState.value;
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
      sort: sort.value,
      filters: filterQuery.value,
    }),
  { watch: [page] },
);

// Searching, re-sorting, or changing a filter resets to the first page; if
// already there, refetch directly so the change still takes effect.
watch(
  [search, sort, filterState],
  () => {
    if (page.value !== 1) page.value = 1;
    else refresh();
  },
  { deep: true },
);

// Filter option lists + numeric bounds come from the server (the current page
// can't reveal every distinct value or the true min/max).
const { data: facets } = useAsyncData("property-facets", fetchPropertyFacets);

const filterFields = computed(() => {
  const f = facets.value;
  if (!f) return [];
  return [
    { key: "category", label: "Category", options: f.category },
    { key: "type", label: "Type", options: f.type },
    { key: "transaction_type", label: "Offering", options: f.transaction_type },
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
  ];
});

const properties = computed<PropertyRow[]>(() =>
  (data.value?.data ?? []).map((p) => ({
    ...p,
    price_label: `EGP ${priceFormatter.format(p.price)}`,
    project_name: p.project?.name ?? "—",
    project_id: p.project?.id ?? "",
    created_at_label: formatDate(p.created_at),
    updated_at_label: formatDate(p.updated_at),
  })),
);

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

const sortFields = [
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

const openInstallments = (row: PropertyRow) => {
  selected.value = row;
  installmentOpen.value = true;
};
</script>
