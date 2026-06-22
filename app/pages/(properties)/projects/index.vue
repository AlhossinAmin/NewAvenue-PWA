<template>
  <ResourcePage
    panel-id="projects"
    title="Projects"
    icon="i-lucide-layout-grid"
    new-label="New project"
    create-to="/projects/new"
  >
    <DataView
      v-model:page="page"
      v-model:search="search"
      v-model:sort="sort"
      server-side
      search-placeholder="Search projects…"
      :rows="projects"
      :columns="columns"
      :sort-fields="sortFields"
      :total="pagination?.total"
      :per-page="pagination?.per_page"
      :loading="status === 'pending'"
      :edit-to="(row) => `/projects/${row.id}`"
    >
      <template #card="{ row }">
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
                  {{ row.resale_units_sold }} /
                  {{ row.total_resale_units }} sold
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
      </template>

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
    </DataView>
  </ResourcePage>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Project } from "~/types/properties/projects";

type ProjectRow = Project & { sold_percent: number; developer_name: string };

const { fetchProjects } = useProjects();

const page = ref(1);
const search = ref("");
const sort = ref<string | null>("-created_at");

const { data, status, refresh } = useAsyncData(
  "projects",
  () =>
    fetchProjects({ page: page.value, search: search.value, sort: sort.value }),
  { watch: [page] },
);

// Searching or re-sorting resets to the first page; if already there, refetch
// directly so the change still takes effect.
watch([search, sort], () => {
  if (page.value !== 1) page.value = 1;
  else refresh();
});

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

const columns: TableColumn<ProjectRow>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "developer", header: "Developer" },
  { accessorKey: "district", header: "District" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "sold_percent", header: "Resale units sold" },
  { accessorKey: "total_resale_units", header: "Total Resale Units" },
  { accessorKey: "commission_scheme", header: "Commission" },
];

const sortFields = [
  { key: "name", label: "Name" },
  { key: "developer", label: "Developer" },
  { key: "district", label: "District" },
  { key: "category", label: "Category" },
  { key: "sold_percent", label: "Resale units sold %" },
  { key: "total_resale_units", label: "Total Resale Units" },
  { key: "commission_scheme", label: "Commission" },
];

const soldPercent = (p: Project): number => {
  if (!p.total_resale_units) return 0;
  return Math.round((p.resale_units_sold / p.total_resale_units) * 100);
};
</script>
