<template>
  <ResourcePage
    panel-id="leads"
    title="Leads"
    icon="i-lucide-user-plus"
    new-label="New lead"
    create-to="/leads/new"
  >
    <DataView
      v-model:page="page"
      v-model:search="search"
      v-model:sort="sort"
      server-side
      mobile-table
      search-placeholder="Search leads…"
      :rows="leads"
      :columns="columns"
      :sort-fields="sortFields"
      :total="pagination?.total"
      :per-page="pagination?.per_page"
      :loading="status === 'pending'"
      :edit-to="(row) => `/leads/${row.id}`"
    >
      <template #card="{ row }">
        <UCard>
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate font-semibold">{{ row.customer_name }}</p>
              <p class="truncate text-sm text-muted">
                {{ row.property_type }} · {{ row.offering_type }}
              </p>
            </div>
            <UBadge
              variant="subtle"
              size="sm"
              :color="stateColor(row.current_state)"
            >
              {{ row.current_state }}
            </UBadge>
          </div>

          <div class="mt-3 flex flex-col gap-2 text-sm">
            <div class="flex items-center gap-1.5 text-muted">
              <UIcon name="i-lucide-map-pin" class="size-4 shrink-0" />
              <span class="truncate">{{ row.location_label }}</span>
            </div>
            <div class="flex items-center justify-between pt-1">
              <div class="flex items-center gap-1.5 text-muted">
                <UIcon name="i-lucide-user" class="size-4 shrink-0" />
                <span class="truncate">{{ row.agent_name }}</span>
              </div>
              <span class="font-semibold">{{ row.budget_label }}</span>
            </div>
          </div>
        </UCard>
      </template>

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
        <UBadge
          variant="subtle"
          :color="stateColor(row.original.current_state)"
        >
          {{ row.original.current_state }}
        </UBadge>
      </template>
    </DataView>
  </ResourcePage>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Lead, LeadState } from "~/constants/dummy/leads";

type LeadRow = Lead & {
  customer_name: string;
  agent_name: string;
  budget_label: string;
  location_label: string;
};

const budgetFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const { fetchLeads } = useLeads();

const page = ref(1);
const search = ref("");
const sort = ref<string | null>("-created_at");

const { data, status, refresh } = useAsyncData(
  "leads",
  () =>
    fetchLeads({ page: page.value, search: search.value, sort: sort.value }),
  { watch: [page] },
);

// Searching or re-sorting resets to the first page; if already there, refetch
// directly so the change still takes effect.
watch([search, sort], () => {
  if (page.value !== 1) page.value = 1;
  else refresh();
});

const leads = computed<LeadRow[]>(() =>
  (data.value?.data ?? []).map((l) => ({
    ...l,
    customer_name: l.customer?.name ?? "Unknown",
    agent_name: l.assigned_agent?.name ?? "Unassigned",
    budget_label: `EGP ${budgetFormatter.format(l.budget)}`,
    location_label:
      [l.neighborhood, l.district].filter(Boolean).join(", ") || "—",
  })),
);

const pagination = computed(() =>
  data.value && !Array.isArray(data.value.pagination)
    ? data.value.pagination
    : null,
);

const STATE_COLOR: Record<
  LeadState,
  "info" | "neutral" | "warning" | "error" | "success" | "primary"
> = {
  New: "info",
  Cold: "neutral",
  Warm: "warning",
  Hot: "error",
  "In Progress": "primary",
  "On Hold": "neutral",
  "Closed Won": "success",
  "Closed Lost": "error",
};

const stateColor = (state: LeadState) => {
  return STATE_COLOR[state];
};

const columns: TableColumn<LeadRow>[] = [
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "property_type", header: "Property" },
  { accessorKey: "offering_type", header: "Offering" },
  { accessorKey: "location_label", header: "Location" },
  { accessorKey: "budget", header: "Budget" },
  { accessorKey: "agent_name", header: "Agent" },
  { accessorKey: "current_state", header: "State" },
];

const sortFields = [
  { key: "customer", label: "Customer" },
  { key: "property_type", label: "Property type" },
  { key: "budget", label: "Budget" },
  { key: "current_state", label: "State" },
  { key: "lead_date", label: "Lead date" },
];
</script>
