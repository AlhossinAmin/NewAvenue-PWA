<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <UInput
        v-model="searchInput"
        icon="i-lucide-search"
        class="flex-1"
        placeholder="Search projects…"
      />

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
          v-for="row in projects"
          class="block"
          :key="row.id"
          :to="`/projects/${row.id}`"
        >
          <UCard>
            <div class="min-w-0">
              <p class="truncate font-semibold">{{ row.name }}</p>
              <p class="truncate text-sm text-muted">
                {{ row.developer_name }}
              </p>
            </div>

            <div class="mt-3 flex flex-col gap-2 text-sm">
              <div class="flex items-center gap-1.5 text-muted">
                <UIcon name="i-lucide-map-pin" class="size-4 shrink-0" />
                <span class="truncate">{{ row.district }}, {{ row.city }}</span>
              </div>

              <div>
                <div class="mb-1 flex justify-between text-xs text-muted">
                  <span>
                    {{ row.resale_units_sold }} / {{ row.total_resale_units }}
                    sold
                  </span>
                  <span>{{ row.resale_units_remaining }} left</span>
                </div>
                <UProgress size="sm" :model-value="row.sold_percent" />
              </div>

              <div class="flex items-center justify-between gap-2 pt-1">
                <div class="flex flex-wrap gap-1">
                  <UBadge
                    v-for="cat in row.category"
                    color="neutral"
                    variant="soft"
                    size="sm"
                    :key="cat"
                  >
                    {{ cat }}
                  </UBadge>
                </div>
                <span class="shrink-0 font-medium"
                  >{{ row.commission_scheme }}% comm.</span
                >
              </div>
            </div>
          </UCard>
        </NuxtLink>
        <p v-if="!projects.length" class="py-12 text-center text-sm text-muted">
          No results.
        </p>
      </template>
    </div>

    <!-- Desktop: table with sortable headers -->
    <div class="hidden sm:block">
      <UTable
        :data="loading ? skeletonData : projects"
        :columns="loading ? skeletonColumns : tableColumns"
        :ui="rowUi"
        @select="selectRow"
      >
        <template #developer-cell="{ row }">
          {{ row.original.developer_name }}
        </template>

        <template #category-cell="{ row }">
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="cat in row.original.category"
              color="neutral"
              variant="soft"
              size="sm"
              :key="cat"
            >
              {{ cat }}
            </UBadge>
          </div>
        </template>

        <template #sold_percent-cell="{ row }">
          <div class="flex w-40 flex-col gap-1">
            <div class="flex justify-between text-xs text-muted">
              <span>
                {{ row.original.resale_units_sold }} /
                {{ row.original.total_resale_units }}
              </span>
              <span>{{ row.original.sold_percent }}%</span>
            </div>
            <UProgress size="sm" :model-value="row.original.sold_percent" />
          </div>
        </template>

        <template #commission_scheme-cell="{ row }">
          {{ row.original.commission_scheme }}%
        </template>
      </UTable>
    </div>

    <!-- Server-side pagination footer -->
    <div
      v-if="pagination && pagination.total > pagination.per_page"
      class="flex items-center justify-between gap-2"
    >
      <p class="text-sm text-muted">{{ pagination.total }} total</p>
      <UPagination
        v-model:page="page"
        showEdges
        :showControls="false"
        :total="pagination.total"
        :items-per-page="pagination.per_page"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Project } from "~/types/properties/projects";

// A project shaped into display-ready fields the table/cards read directly
// (no function calls in templates).
type ProjectRow = Project & { sold_percent: number; developer_name: string };

const soldPercent = (p: Project): number => {
  if (!p.total_resale_units) return 0;
  return Math.round((p.resale_units_sold / p.total_resale_units) * 100);
};

const columns: TableColumn<ProjectRow>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "developer", header: "Developer" },
  { accessorKey: "district", header: "District" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "sold_percent", header: "Resale units sold" },
  { accessorKey: "total_resale_units", header: "Total Resale Units" },
  { accessorKey: "commission_scheme", header: "Commission" },
];

const SORT_FIELDS = [
  { key: "name", label: "Name" },
  { key: "developer", label: "Developer" },
  { key: "district", label: "District" },
  { key: "category", label: "Category" },
  { key: "sold_percent", label: "Resale units sold %" },
  { key: "total_resale_units", label: "Total Resale Units" },
  { key: "commission_scheme", label: "Commission" },
];

const editTo = (row: ProjectRow) => `/projects/${row.id}`;

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
  selectRow,
  rowUi,
} = useTable<ProjectRow>({
  columns,
  sortFields: SORT_FIELDS,
  editTo,
  initialSort: "-created_at",
});

const sortOpen = ref(false);

const { fetchProjects } = useProjects();

const { data, status, refresh } = useAsyncData(
  "projects",
  () =>
    fetchProjects({
      page: page.value,
      search: search.value,
      sort: sortParam.value,
    }),
  { watch: [page] },
);

// Searching or re-sorting resets to the first page; if already there, refetch
// directly so the change still takes effect.
watch([search, sortParam], () => {
  if (page.value !== 1) page.value = 1;
  else refresh();
});

const loading = computed(() => status.value === "pending");

const projects = computed<ProjectRow[]>(() =>
  (data.value?.data ?? []).map((p) => ({
    ...p,
    sold_percent: soldPercent(p),
    developer_name: p.developer?.name ?? "",
  })),
);

const pagination = computed(() =>
  data.value && !Array.isArray(data.value.pagination)
    ? data.value.pagination
    : null,
);
</script>
