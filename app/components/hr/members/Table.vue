<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <UInput
        v-model="searchInput"
        icon="i-lucide-search"
        class="flex-1"
        placeholder="Search members…"
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
          v-for="row in members"
          class="block"
          :key="row.id"
          :to="`/members/${row.id}`"
        >
          <UCard>
            <div class="flex items-center gap-3">
              <UAvatar :text="row.initials" />
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <p class="truncate font-medium">{{ row.name }}</p>
                  <UBadge variant="subtle" size="sm" :color="row.status_color">
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
              <span class="font-semibold text-default">
                {{ row.salary_label }}
              </span>
            </div>
          </UCard>
        </NuxtLink>
        <p v-if="!members.length" class="py-12 text-center text-sm text-muted">
          No results.
        </p>
      </template>
    </div>

    <!-- Desktop: table with sortable headers -->
    <div class="hidden sm:block">
      <UTable
        :data="loading ? skeletonData : members"
        :columns="loading ? skeletonColumns : tableColumns"
      >
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar size="sm" :text="row.original.initials" />
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
          <UBadge variant="subtle" :color="row.original.status_color">
            {{ row.original.status }}
          </UBadge>
        </template>
      </UTable>
    </div>

    <!-- Server-side pagination footer -->
    <div
      v-if="pagination && pagination.total > pagination.per_page"
      class="flex items-center justify-between gap-2"
    >
      <p class="text-sm text-muted">{{ pagination.total }} results</p>
      <UPagination
        v-model:page="page"
        :total="pagination.total"
        :items-per-page="pagination.per_page"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Member, MemberStatus } from "~/types/hr/members";

// A member shaped into display-ready fields the table/cards read directly
// (no function calls in templates).
type MemberRow = Member & {
  initials: string;
  salary_label: string;
  status_color: "success" | "neutral" | "warning";
};

const STATUS_COLOR: Record<MemberStatus, MemberRow["status_color"]> = {
  Active: "success",
  Inactive: "neutral",
  "On Leave": "warning",
};

const salaryFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const initials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const columns: TableColumn<MemberRow>[] = [
  { accessorKey: "name", header: "Member" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "team", header: "Team" },
  { accessorKey: "current_num_of_leads", header: "Leads" },
  { accessorKey: "points", header: "Points" },
  { accessorKey: "status", header: "Status" },
];

const SORT_FIELDS = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "team", label: "Team" },
  { key: "current_num_of_leads", label: "Leads" },
  { key: "points", label: "Points" },
  { key: "date_joined", label: "Date joined" },
  { key: "status", label: "Status" },
];

const editTo = (row: MemberRow) => `/members/${row.id}`;

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
} = useTable<MemberRow>({
  columns,
  sortFields: SORT_FIELDS,
  editTo,
  initialSort: "-created_at",
});

const sortOpen = ref(false);

const { fetchMembers } = useMembers();

const { data, status, refresh } = useAsyncData(
  "members",
  () =>
    fetchMembers({
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

const members = computed<MemberRow[]>(() =>
  (data.value?.data ?? []).map((m) => ({
    ...m,
    initials: initials(m.name),
    salary_label: `EGP ${salaryFormatter.format(m.effective_salary)}`,
    status_color: STATUS_COLOR[m.status],
  })),
);

const pagination = computed(() =>
  data.value && !Array.isArray(data.value.pagination)
    ? data.value.pagination
    : null,
);
</script>
