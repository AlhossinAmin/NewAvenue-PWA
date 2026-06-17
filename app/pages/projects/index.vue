<template>
  <ResourcePage
    panel-id="projects"
    title="Projects"
    icon="i-lucide-layout-grid"
    new-label="New project"
    create-to="/projects/new"
  >
    <DataView
      :rows="projects"
      :columns="columns"
      :sort-fields="sortFields"
      search-placeholder="Search projects…"
      :edit-to="(row) => `/projects/${row.id}`"
    >
      <template #card="{ row }">
        <UCard>
          <div class="min-w-0">
            <p class="truncate font-semibold">{{ row.name }}</p>
            <p class="truncate text-sm text-muted">{{ row.developer }}</p>
          </div>

          <div class="mt-3 flex flex-col gap-2 text-sm">
            <div class="flex items-center gap-1.5 text-muted">
              <UIcon name="i-lucide-map-pin" class="size-4 shrink-0" />
              <span class="truncate">{{ row.district }}, {{ row.city }}</span>
            </div>

            <div>
              <div class="mb-1 flex justify-between text-xs text-muted">
                <span>{{ row.units_sold }} / {{ row.total_units }} sold</span>
                <span>{{ row.units_remaining }} left</span>
              </div>
              <UProgress :model-value="row.sold_percent" size="sm" />
            </div>

            <div class="flex items-center justify-between gap-2 pt-1">
              <div class="flex flex-wrap gap-1">
                <UBadge
                  v-for="cat in row.category"
                  :key="cat"
                  color="neutral"
                  variant="soft"
                  size="sm"
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

      <template #category-cell="{ row }">
        <div class="flex flex-wrap gap-1">
          <UBadge
            v-for="cat in row.original.category"
            :key="cat"
            color="neutral"
            variant="soft"
            size="sm"
          >
            {{ cat }}
          </UBadge>
        </div>
      </template>

      <template #sold_percent-cell="{ row }">
        <div class="flex w-40 flex-col gap-1">
          <div class="flex justify-between text-xs text-muted">
            <span>
              {{ row.original.units_sold }} / {{ row.original.total_units }}
            </span>
            <span>{{ row.original.sold_percent }}%</span>
          </div>
          <UProgress :model-value="row.original.sold_percent" size="sm" />
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
import { DUMMY_PROJECTS, type Project } from "~/constants/dummy/projects";

type ProjectRow = Project & { sold_percent: number };

const projects = computed<ProjectRow[]>(() =>
  DUMMY_PROJECTS.map((p) => ({
    ...p,
    sold_percent: soldPercent(p),
  })),
);

const columns: TableColumn<ProjectRow>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "developer", header: "Developer" },
  { accessorKey: "district", header: "District" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "sold_percent", header: "Units sold" },
  { accessorKey: "commission_scheme", header: "Commission" },
];

const sortFields = [
  { key: "name", label: "Name" },
  { key: "developer", label: "Developer" },
  { key: "district", label: "District" },
  { key: "category", label: "Category" },
  { key: "sold_percent", label: "Units sold %" },
  { key: "commission_scheme", label: "Commission" },
];

const soldPercent = (p: Project): number => {
  if (!p.total_units) return 0;
  return Math.round((p.units_sold / p.total_units) * 100);
};
</script>
