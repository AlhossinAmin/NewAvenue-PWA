<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <UInput
        v-model="searchInput"
        icon="i-lucide-search"
        class="flex-1"
        placeholder="Search leads…"
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

    <!-- Table at all breakpoints (mobile-table: scroll horizontally on small
         screens; no mobile card list) -->
    <div class="block overflow-x-auto">
      <UTable
        :data="loading ? skeletonData : leads"
        :columns="loading ? skeletonColumns : tableColumns"
      >
        <template #customer-cell="{ row }">
          <span class="font-medium">{{ row.original.customer_name }}</span>
        </template>

        <template #offering_type-cell="{ row }">
          <UBadge color="neutral" variant="soft">
            {{ row.original.offering_type }}
          </UBadge>
        </template>

        <template #budget-cell="{ row }">
          {{ row.original.budget_label }}
        </template>

        <template #current_state-cell="{ row }">
          <UBadge variant="subtle" :color="row.original.state_color">
            {{ row.original.current_state }}
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
import type { Lead, LeadState } from "~/types/crm/leads";

// A lead shaped into display-ready fields the table reads directly
// (no function calls in templates).
type LeadRow = Lead & {
  customer_name: string;
  agent_name: string;
  budget_label: string;
  location_label: string;
  state_color: "info" | "neutral" | "warning" | "error" | "success" | "primary";
};

const STATE_COLOR: Record<LeadState, LeadRow["state_color"]> = {
  New: "info",
  Cold: "neutral",
  Warm: "warning",
  Hot: "error",
  "In Progress": "primary",
  "On Hold": "neutral",
  "Closed Won": "success",
  "Closed Lost": "error",
};

const budgetFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const columns: TableColumn<LeadRow>[] = [
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "property_type", header: "Property" },
  { accessorKey: "offering_type", header: "Offering" },
  { accessorKey: "location_label", header: "Location" },
  { accessorKey: "budget", header: "Budget" },
  { accessorKey: "agent_name", header: "Agent" },
  { accessorKey: "current_state", header: "State" },
];

const SORT_FIELDS = [
  { key: "customer", label: "Customer" },
  { key: "property_type", label: "Property type" },
  { key: "budget", label: "Budget" },
  { key: "current_state", label: "State" },
  { key: "lead_date", label: "Lead date" },
];

const editTo = (row: LeadRow) => `/leads/${row.id}`;

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
} = useTable<LeadRow>({
  columns,
  sortFields: SORT_FIELDS,
  editTo,
  initialSort: "-created_at",
});

const sortOpen = ref(false);

const { fetchLeads } = useLeads();

const { data, status, refresh } = useAsyncData(
  "leads",
  () =>
    fetchLeads({
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

const leads = computed<LeadRow[]>(() =>
  (data.value?.data ?? []).map((l) => ({
    ...l,
    customer_name: l.customer?.name ?? "Unknown",
    agent_name: l.assigned_agent?.name ?? "Unassigned",
    budget_label: `EGP ${budgetFormatter.format(l.budget)}`,
    location_label:
      [l.neighborhood, l.district].filter(Boolean).join(", ") || "—",
    state_color: STATE_COLOR[l.current_state],
  })),
);

const pagination = computed(() =>
  data.value && !Array.isArray(data.value.pagination)
    ? data.value.pagination
    : null,
);
</script>
