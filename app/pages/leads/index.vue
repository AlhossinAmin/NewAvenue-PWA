<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import {
  DUMMY_LEADS,
  type Lead,
  type LeadState,
} from "~/constants/dummy/leads";
import { DUMMY_CONTACTS } from "~/constants/dummy/contacts";
import { DUMMY_MEMBERS } from "~/constants/dummy/members";

const contactName = new Map(DUMMY_CONTACTS.map((c) => [c.id, c.name]));
const agentName = new Map(DUMMY_MEMBERS.map((m) => [m.id, m.name]));

const budgetFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

type LeadRow = Lead & {
  customer_name: string;
  agent_name: string;
  budget_label: string;
};

const leads: LeadRow[] = DUMMY_LEADS.map((l) => ({
  ...l,
  customer_name: contactName.get(l.customer) ?? "Unknown",
  agent_name: agentName.get(l.assigned_agent) ?? "Unassigned",
  budget_label: `EGP ${budgetFormatter.format(l.budget)}`,
}));

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

function stateColor(state: LeadState) {
  return STATE_COLOR[state];
}

const columns: TableColumn<LeadRow>[] = [
  { accessorKey: "customer_name", header: "Customer" },
  { accessorKey: "property_type", header: "Property" },
  { accessorKey: "offering_type", header: "Offering" },
  { accessorKey: "segment", header: "Segment" },
  { accessorKey: "budget", header: "Budget" },
  { accessorKey: "agent_name", header: "Agent" },
  { accessorKey: "current_state", header: "State" },
];

const sortFields = [
  { key: "customer_name", label: "Customer" },
  { key: "property_type", label: "Property type" },
  { key: "segment", label: "Segment" },
  { key: "budget", label: "Budget" },
  { key: "agent_name", label: "Agent" },
  { key: "current_state", label: "State" },
  { key: "lead_date", label: "Lead date" },
];
</script>

<template>
  <ResourcePage
    panel-id="leads"
    title="Leads"
    icon="i-lucide-user-plus"
    new-label="New lead"
    create-to="/leads/new"
  >
    <DataView
      :rows="leads"
      :columns="columns"
      :sort-fields="sortFields"
      search-placeholder="Search leads…"
      :edit-to="(row) => `/leads/${row.id}`"
      mobile-table
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
              :color="stateColor(row.current_state)"
              variant="subtle"
              size="sm"
            >
              {{ row.current_state }}
            </UBadge>
          </div>

          <div class="mt-3 flex flex-col gap-2 text-sm">
            <div class="flex items-center gap-1.5 text-muted">
              <UIcon name="i-lucide-map-pin" class="size-4 shrink-0" />
              <span class="truncate">{{ row.pref_location }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-muted">
              <UIcon name="i-lucide-user" class="size-4 shrink-0" />
              <span class="truncate">{{ row.agent_name }}</span>
            </div>
            <div class="flex items-center justify-between pt-1">
              <UBadge color="neutral" variant="soft" size="sm">
                {{ row.segment }}
              </UBadge>
              <span class="font-semibold">{{ row.budget_label }}</span>
            </div>
          </div>
        </UCard>
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
          :color="stateColor(row.original.current_state)"
          variant="subtle"
        >
          {{ row.original.current_state }}
        </UBadge>
      </template>
    </DataView>
  </ResourcePage>
</template>
