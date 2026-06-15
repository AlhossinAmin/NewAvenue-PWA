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
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate font-semibold">{{ row.name }}</p>
              <p class="truncate text-sm text-muted">{{ row.developer }}</p>
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

            <div>
              <div class="mb-1 flex justify-between text-xs text-muted">
                <span>{{ row.units_sold }} / {{ row.total_units }} sold</span>
                <span>{{ row.units_remaining }} left</span>
              </div>
              <UProgress :model-value="row.sold_percent" size="sm" />
            </div>

            <div class="flex items-center justify-between pt-1">
              <UBadge color="neutral" variant="soft" size="sm">
                {{ row.category }}
              </UBadge>
              <span class="font-medium"
                >{{ row.commission_scheme }}% comm.</span
              >
            </div>
          </div>
        </UCard>
      </template>

      <template #status-cell="{ row }">
        <UBadge :color="statusColor(row.original.status)" variant="subtle">
          {{ row.original.status }}
        </UBadge>
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
import {
  DUMMY_PROJECTS,
  type Project,
  type ProjectStatus,
} from "~/constants/dummy/projects";

type ProjectRow = Project & { sold_percent: number };

const projects: ProjectRow[] = DUMMY_PROJECTS.map((p) => ({
  ...p,
  sold_percent: soldPercent(p),
}));

const STATUS_COLOR: Record<
  ProjectStatus,
  "success" | "neutral" | "info" | "warning" | "primary"
> = {
  Selling: "success",
  "Pre-Launch": "info",
  "Under Construction": "warning",
  Delivered: "primary",
  "Sold Out": "neutral",
};

function statusColor(status: ProjectStatus) {
  return STATUS_COLOR[status];
}

const columns: TableColumn<ProjectRow>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "developer", header: "Developer" },
  { accessorKey: "district", header: "District" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "sold_percent", header: "Units sold" },
  { accessorKey: "commission_scheme", header: "Commission" },
];

const sortFields = [
  { key: "name", label: "Name" },
  { key: "developer", label: "Developer" },
  { key: "district", label: "District" },
  { key: "category", label: "Category" },
  { key: "status", label: "Status" },
  { key: "sold_percent", label: "Units sold %" },
  { key: "commission_scheme", label: "Commission" },
];

function soldPercent(p: Project): number {
  if (!p.total_units) return 0;
  return Math.round((p.units_sold / p.total_units) * 100);
}
</script>
