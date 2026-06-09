<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { DUMMY_MEMBERS, type Member } from "~/constants/dummy/members";

const targetFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

type MemberRow = Member & { initials: string; target_label: string };

const members: MemberRow[] = DUMMY_MEMBERS.map((m) => ({
  ...m,
  initials: initials(m.name),
  target_label: formatTarget(m.target),
}));

const columns: TableColumn<MemberRow>[] = [
  { accessorKey: "name", header: "Member" },
  { accessorKey: "position", header: "Position" },
  { accessorKey: "target", header: "Target" },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatTarget(value: number): string {
  return `EGP ${targetFormatter.format(value)}`;
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
            <p class="truncate font-medium">{{ m.name }}</p>
            <p class="truncate text-sm text-muted">{{ m.position }}</p>
          </div>
          <span class="shrink-0 text-sm font-semibold">
            {{ m.target_label }}
          </span>
        </div>
      </UCard>
    </div>

    <!-- Table on larger screens -->
    <div class="hidden sm:block">
      <UTable :data="members" :columns="columns">
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :text="row.original.initials" size="sm" />
            <span class="font-medium">{{ row.original.name }}</span>
          </div>
        </template>

        <template #position-cell="{ row }">
          <UBadge color="neutral" variant="soft">
            {{ row.original.position }}
          </UBadge>
        </template>

        <template #target-cell="{ row }">
          {{ row.original.target_label }}
        </template>
      </UTable>
    </div>
  </ResourcePage>
</template>
