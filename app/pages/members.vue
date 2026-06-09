<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import {
  DUMMY_MEMBERS,
  type Member,
  type MemberStatus,
} from "~/constants/dummy/members";

const salaryFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

type MemberRow = Member & { initials: string; salary_label: string };

const members: MemberRow[] = DUMMY_MEMBERS.map((m) => ({
  ...m,
  initials: initials(m.name),
  salary_label: `EGP ${salaryFormatter.format(m.effective_salary)}`,
}));

const statusColor: Record<MemberStatus, "success" | "neutral" | "warning"> = {
  Active: "success",
  Inactive: "neutral",
  "On Leave": "warning",
};

const columns: TableColumn<MemberRow>[] = [
  { accessorKey: "name", header: "Member" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "team", header: "Team" },
  { accessorKey: "current_num_of_leads", header: "Leads" },
  { accessorKey: "points", header: "Points" },
  { accessorKey: "effective_salary", header: "Salary" },
  { accessorKey: "status", header: "Status" },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
</script>

<template>
  <ResourcePage
    panel-id="members"
    title="Members"
    icon="i-lucide-users"
    new-label="Invite member"
  >
    <!-- Mobile-first: card list on small screens -->
    <div class="flex flex-col gap-2 sm:hidden">
      <UCard v-for="m in members" :key="m.id">
        <div class="flex items-center gap-3">
          <UAvatar :text="m.initials" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="truncate font-medium">{{ m.name }}</p>
              <UBadge :color="statusColor[m.status]" variant="subtle" size="sm">
                {{ m.status }}
              </UBadge>
            </div>
            <p class="truncate text-sm text-muted">
              {{ m.role }} · {{ m.team }}
            </p>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between text-sm text-muted">
          <span class="flex items-center gap-1.5">
            <UIcon name="i-lucide-target" class="size-4 shrink-0" />
            {{ m.current_num_of_leads }} leads
          </span>
          <span class="flex items-center gap-1.5">
            <UIcon name="i-lucide-star" class="size-4 shrink-0" />
            {{ m.points }} pts
          </span>
          <span class="font-semibold text-default">{{ m.salary_label }}</span>
        </div>
      </UCard>
    </div>

    <!-- Table on larger screens -->
    <div class="hidden sm:block">
      <UTable :data="members" :columns="columns">
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :text="row.original.initials" size="sm" />
            <div class="min-w-0">
              <p class="truncate font-medium">{{ row.original.name }}</p>
              <p class="truncate text-xs text-muted">
                {{ row.original.email }}
              </p>
            </div>
          </div>
        </template>

        <template #role-cell="{ row }">
          <UBadge color="neutral" variant="soft">{{
            row.original.role
          }}</UBadge>
        </template>

        <template #effective_salary-cell="{ row }">
          {{ row.original.salary_label }}
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="statusColor[row.original.status]" variant="subtle">
            {{ row.original.status }}
          </UBadge>
        </template>
      </UTable>
    </div>
  </ResourcePage>
</template>
