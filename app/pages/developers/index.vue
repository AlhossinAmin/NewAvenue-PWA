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
                  :color="agreementColor(row.agreement)"
                  variant="subtle"
                  size="sm"
                >
                  {{ row.agreement }}
                </UBadge>
              </div>
              <p class="mt-1 line-clamp-2 text-sm text-muted">
                {{ row.description }}
              </p>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between text-sm">
            <div class="flex items-center gap-3 text-muted">
              <span class="flex items-center gap-1.5">
                <UIcon name="i-lucide-layout-grid" class="size-4 shrink-0" />
                {{ row.projects_count }} projects
              </span>
              <span class="flex items-center gap-1.5">
                <UIcon name="i-lucide-handshake" class="size-4 shrink-0" />
                {{ row.num_deals }} deals
              </span>
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

      <template #agreement-cell="{ row }">
        <UBadge
          :color="agreementColor(row.original.agreement)"
          variant="subtle"
        >
          {{ row.original.agreement }}
        </UBadge>
      </template>
    </DataView>
  </ResourcePage>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import {
  DUMMY_DEVELOPERS,
  type Developer,
  type AgreementStatus,
} from "~/constants/dummy/developers";

type DeveloperRow = Developer & { initials: string; commission_label: string };

const developers: DeveloperRow[] = DUMMY_DEVELOPERS.map((d) => ({
  ...d,
  initials: initials(d.name),
  commission_label: commissionLabel(d),
}));

const AGREEMENT_COLOR: Record<
  AgreementStatus,
  "success" | "warning" | "error"
> = {
  Signed: "success",
  Pending: "warning",
  Expired: "error",
};

function agreementColor(agreement: AgreementStatus) {
  return AGREEMENT_COLOR[agreement];
}

const columns: TableColumn<DeveloperRow>[] = [
  { accessorKey: "name", header: "Developer" },
  { accessorKey: "country", header: "Country" },
  { accessorKey: "projects_count", header: "Projects" },
  { accessorKey: "num_deals", header: "Deals" },
  { accessorKey: "default_commission", header: "Commission" },
  { accessorKey: "agreement", header: "Agreement" },
];

const sortFields = [
  { key: "name", label: "Name" },
  { key: "country", label: "Country" },
  { key: "projects_count", label: "Projects" },
  { key: "num_deals", label: "Deals" },
  { key: "default_commission", label: "Commission" },
  { key: "agreement", label: "Agreement" },
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
