<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import {
  DUMMY_DEVELOPERS,
  type Developer,
  type DeveloperStatus,
} from "~/constants/dummy/developers";

type DeveloperRow = Developer & { initials: string; commission_label: string };

const developers: DeveloperRow[] = DUMMY_DEVELOPERS.map((d) => ({
  ...d,
  initials: initials(d.name),
  commission_label: commissionLabel(d),
}));

const STATUS_COLOR: Record<DeveloperStatus, "success" | "neutral"> = {
  Active: "success",
  Inactive: "neutral",
};

function statusColor(status: DeveloperStatus) {
  return STATUS_COLOR[status];
}

const columns: TableColumn<DeveloperRow>[] = [
  { accessorKey: "name", header: "Developer" },
  { accessorKey: "country", header: "Country" },
  { accessorKey: "projects_count", header: "Projects" },
  { accessorKey: "default_commission", header: "Commission" },
  { accessorKey: "status", header: "Status" },
];

const sortFields = [
  { key: "name", label: "Name" },
  { key: "country", label: "Country" },
  { key: "projects_count", label: "Projects" },
  { key: "default_commission", label: "Commission" },
  { key: "status", label: "Status" },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function commissionLabel(d: Developer): string {
  return d.commission_min === d.commission_max
    ? `${d.default_commission}%`
    : `${d.commission_min}–${d.commission_max}%`;
}
</script>

<template>
  <ResourcePage
    panel-id="developers"
    title="Developers"
    icon="i-lucide-building-2"
    new-label="New developer"
    create-to="/developers/new"
  >
    <DataView
      :rows="developers"
      :columns="columns"
      :sort-fields="sortFields"
      search-placeholder="Search developers…"
      :edit-to="(row) => `/developers/${row.id}`"
    >
      <template #card="{ row }">
        <UCard>
          <div class="flex items-start gap-3">
            <UAvatar :src="row.logo" :alt="row.name" :text="row.initials" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <p class="truncate font-semibold">{{ row.name }}</p>
                <UBadge
                  :color="statusColor(row.status)"
                  variant="subtle"
                  size="sm"
                >
                  {{ row.status }}
                </UBadge>
              </div>
              <p class="mt-1 line-clamp-2 text-sm text-muted">
                {{ row.description }}
              </p>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between text-sm">
            <div class="flex items-center gap-1.5 text-muted">
              <UIcon name="i-lucide-layout-grid" class="size-4 shrink-0" />
              <span>{{ row.projects_count }} projects</span>
            </div>
            <span class="font-medium">{{ row.commission_label }} comm.</span>
          </div>
        </UCard>
      </template>

      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar
            :src="row.original.logo"
            :alt="row.original.name"
            :text="row.original.initials"
            size="sm"
          />
          <span class="font-medium">{{ row.original.name }}</span>
        </div>
      </template>

      <template #default_commission-cell="{ row }">
        {{ row.original.commission_label }}
      </template>

      <template #status-cell="{ row }">
        <UBadge :color="statusColor(row.original.status)" variant="subtle">
          {{ row.original.status }}
        </UBadge>
      </template>
    </DataView>
  </ResourcePage>
</template>
