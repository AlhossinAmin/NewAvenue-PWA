<template>
  <ResourcePage
    panel-id="members"
    title="Members"
    icon="i-lucide-users"
    new-label="Invite member"
    create-to="/members/new"
  >
    <DataView
      v-model:page="page"
      v-model:search="search"
      v-model:sort="sort"
      server-side
      search-placeholder="Search members…"
      :rows="members"
      :columns="columns"
      :sort-fields="sortFields"
      :total="pagination?.total"
      :per-page="pagination?.per_page"
      :loading="status === 'pending'"
      :edit-to="(row) => `/members/${row.id}`"
    >
      <template #card="{ row }">
        <UCard>
          <div class="flex items-center gap-3">
            <UAvatar :text="row.initials" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <p class="truncate font-medium">{{ row.name }}</p>
                <UBadge
                  variant="subtle"
                  size="sm"
                  :color="statusColor(row.status)"
                >
                  {{ row.status }}
                </UBadge>
              </div>
              <p class="truncate text-sm text-muted">
                {{ row.role }} · {{ row.team }}
              </p>
            </div>
          </div>

          <div
            class="mt-3 flex items-center justify-between text-sm text-muted"
          >
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-target" class="size-4 shrink-0" />
              {{ row.current_num_of_leads }} leads
            </span>
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-star" class="size-4 shrink-0" />
              {{ row.points }} pts
            </span>
            <span class="font-semibold text-default">{{
              row.salary_label
            }}</span>
          </div>
        </UCard>
      </template>

      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar size="sm" :text="row.original.initials" />
          <div class="min-w-0">
            <p class="truncate font-medium">{{ row.original.name }}</p>
            <p class="truncate text-xs text-muted">{{ row.original.email }}</p>
          </div>
        </div>
      </template>

      <template #role-cell="{ row }">
        <UBadge color="neutral" variant="soft">{{ row.original.role }}</UBadge>
      </template>

      <template #effective_salary-cell="{ row }">
        {{ row.original.salary_label }}
      </template>

      <template #status-cell="{ row }">
        <UBadge variant="subtle" :color="statusColor(row.original.status)">
          {{ row.original.status }}
        </UBadge>
      </template>
    </DataView>
  </ResourcePage>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Member, MemberStatus } from "~/constants/dummy/members";

const salaryFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

type MemberRow = Member & { initials: string; salary_label: string };

const { fetchMembers } = useMembers();

const page = ref(1);
const search = ref("");
const sort = ref<string | null>("-created_at");

const { data, status, refresh } = useAsyncData(
  "members",
  () =>
    fetchMembers({ page: page.value, search: search.value, sort: sort.value }),
  { watch: [page] },
);

// Searching or re-sorting resets to the first page; if already there, refetch
// directly so the change still takes effect.
watch([search, sort], () => {
  if (page.value !== 1) page.value = 1;
  else refresh();
});

const members = computed<MemberRow[]>(() =>
  (data.value?.data ?? []).map((m) => ({
    ...m,
    initials: initials(m.name),
    salary_label: `EGP ${salaryFormatter.format(m.effective_salary)}`,
  })),
);

const pagination = computed(() =>
  data.value && !Array.isArray(data.value.pagination)
    ? data.value.pagination
    : null,
);

const STATUS_COLOR: Record<MemberStatus, "success" | "neutral" | "warning"> = {
  Active: "success",
  Inactive: "neutral",
  "On Leave": "warning",
};

const statusColor = (status: MemberStatus) => {
  return STATUS_COLOR[status];
};

const columns: TableColumn<MemberRow>[] = [
  { accessorKey: "name", header: "Member" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "team", header: "Team" },
  { accessorKey: "current_num_of_leads", header: "Leads" },
  { accessorKey: "points", header: "Points" },
  { accessorKey: "status", header: "Status" },
];

const sortFields = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "team", label: "Team" },
  { key: "current_num_of_leads", label: "Leads" },
  { key: "points", label: "Points" },
  { key: "date_joined", label: "Date joined" },
  { key: "status", label: "Status" },
];

const initials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};
</script>
