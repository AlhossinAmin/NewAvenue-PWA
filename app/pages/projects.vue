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

const statusColor: Record<
  ProjectStatus,
  "success" | "neutral" | "info" | "warning" | "primary"
> = {
  Selling: "success",
  "Pre-Launch": "info",
  "Under Construction": "warning",
  Delivered: "primary",
  "Sold Out": "neutral",
};

const columns: TableColumn<ProjectRow>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "developer", header: "Developer" },
  { accessorKey: "district", header: "District" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "units", header: "Units sold" },
  { accessorKey: "commission_scheme", header: "Commission" },
];

function soldPercent(p: Project): number {
  if (!p.total_units) return 0;
  return Math.round((p.units_sold / p.total_units) * 100);
}
</script>

<template>
  <ResourcePage
    panel-id="projects"
    title="Projects"
    icon="i-lucide-layout-grid"
    new-label="New project"
  >
    <!-- Mobile-first: card list on small screens -->
    <div class="flex flex-col gap-3 sm:hidden">
      <UCard v-for="p in projects" :key="p.id">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="truncate font-semibold">{{ p.name }}</p>
            <p class="truncate text-sm text-muted">{{ p.developer }}</p>
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

          <div>
            <div class="mb-1 flex justify-between text-xs text-muted">
              <span>{{ p.units_sold }} / {{ p.total_units }} sold</span>
              <span>{{ p.units_remaining }} left</span>
            </div>
            <UProgress :model-value="p.sold_percent" size="sm" />
          </div>

          <div class="flex items-center justify-between pt-1">
            <UBadge color="neutral" variant="soft" size="sm">
              {{ p.category }}
            </UBadge>
            <span class="font-medium">{{ p.commission_scheme }}% comm.</span>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Table on larger screens -->
    <div class="hidden sm:block">
      <UTable :data="projects" :columns="columns">
        <template #status-cell="{ row }">
          <UBadge :color="statusColor[row.original.status]" variant="subtle">
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #units-cell="{ row }">
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
      </UTable>
    </div>
  </ResourcePage>
</template>
