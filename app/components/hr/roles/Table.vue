<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <UInput
        v-model="searchInput"
        icon="i-lucide-search"
        class="flex-1"
        placeholder="Search roles…"
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
          <USkeleton class="h-4 w-1/2" />
          <USkeleton class="mt-3 h-3 w-3/4" />
        </div>
      </template>
      <template v-else>
        <NuxtLink
          v-for="row in roles"
          class="block"
          :key="row.id"
          :to="`/roles/${row.id}`"
        >
          <UCard>
            <div class="flex items-center justify-between gap-2">
              <p class="truncate font-medium">{{ row.name }}</p>
              <UBadge color="neutral" variant="soft" size="sm">
                {{ row.num_of_members }} members
              </UBadge>
            </div>
            <div class="mt-2 flex items-center gap-2 text-sm">
              <UBadge color="neutral" variant="subtle" size="sm">
                {{ row.tier_label }}
              </UBadge>
              <span v-if="row.commission_eligibility" class="text-muted">
                Commission eligible
              </span>
            </div>
          </UCard>
        </NuxtLink>
        <p v-if="!roles.length" class="py-12 text-center text-sm text-muted">
          No results.
        </p>
      </template>
    </div>

    <!-- Desktop: table with sortable headers -->
    <div class="hidden sm:block">
      <UTable
        :data="loading ? skeletonData : roles"
        :columns="loading ? skeletonColumns : tableColumns"
        :ui="rowUi"
        @select="selectRow"
      >
        <template #name-cell="{ row }">
          <span class="font-medium">{{ row.original.name }}</span>
        </template>

        <template #tier-cell="{ row }">
          <UBadge color="neutral" variant="subtle">
            {{ row.original.tier_label }}
          </UBadge>
        </template>

        <template #commission_eligibility-cell="{ row }">
          <UBadge
            variant="subtle"
            :color="row.original.commission_eligibility ? 'success' : 'neutral'"
          >
            {{ row.original.commission_eligibility ? "Eligible" : "No" }}
          </UBadge>
        </template>

        <template #num_of_members-cell="{ row }">
          <UBadge color="neutral" variant="soft">
            {{ row.original.num_of_members }}
          </UBadge>
        </template>
      </UTable>
    </div>

    <!-- Server-side pagination footer -->
    <div
      v-if="pagination && pagination.total > pagination.per_page"
      class="flex items-center justify-between gap-2"
    >
      <p class="text-sm text-muted">{{ pagination.total }} total</p>
      <UPagination
        v-model:page="page"
        showEdges
        :showControls="false"
        :total="pagination.total"
        :items-per-page="pagination.per_page"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Role } from "~/types/hr/roles";

// A role shaped into display-ready fields the table/cards read directly
// (no function calls in templates).
type RoleRow = Role & { tier_label: string };

const columns: TableColumn<RoleRow>[] = [
  { accessorKey: "name", header: "Role" },
  { accessorKey: "tier", header: "Tier" },
  { accessorKey: "commission_eligibility", header: "Commission" },
  { accessorKey: "num_of_members", header: "Members" },
];

const SORT_FIELDS = [
  { key: "name", label: "Name" },
  { key: "tier", label: "Tier" },
];

const editTo = (row: RoleRow) => `/roles/${row.id}`;

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
  selectRow,
  rowUi,
} = useTable<RoleRow>({
  columns,
  sortFields: SORT_FIELDS,
  editTo,
  initialSort: "-created_at",
});

const sortOpen = ref(false);

const { fetchRoles } = useRoles();

const { data, status, refresh } = useAsyncData(
  "roles",
  () =>
    fetchRoles({
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

const roles = computed<RoleRow[]>(() =>
  (data.value?.data ?? []).map((r) => ({
    ...r,
    tier_label: r.tier ?? "—",
  })),
);

const pagination = computed(() =>
  data.value && !Array.isArray(data.value.pagination)
    ? data.value.pagination
    : null,
);
</script>
