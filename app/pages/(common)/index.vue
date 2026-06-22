<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Dashboard" icon="i-lucide-house">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UColorModeButton />
          <UButton
            icon="i-lucide-bell"
            color="neutral"
            variant="ghost"
            square
          />
          <UButton
            icon="i-lucide-plus"
            label="New property"
            color="primary"
            to="/properties/new"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Stat cards -->
      <UPageGrid class="lg:grid-cols-4">
        <UPageCard
          v-for="stat in stats"
          variant="subtle"
          :key="stat.label"
          :icon="stat.icon"
          :title="stat.label"
        >
          <div class="flex items-end justify-between gap-2">
            <span class="text-2xl font-semibold">{{ stat.value }}</span>
            <UBadge
              variant="subtle"
              size="sm"
              :color="stat.positive ? 'success' : 'error'"
            >
              {{ stat.change }}
            </UBadge>
          </div>
        </UPageCard>
      </UPageGrid>

      <!-- Chart + lead sources -->
      <div class="mt-6 grid gap-6 lg:grid-cols-3">
        <UCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-start justify-between gap-2">
              <div>
                <h2 class="text-lg font-semibold">Sales performance</h2>
                <p class="text-sm text-muted">
                  Commission earned over the last 6 months
                </p>
              </div>
              <div class="text-right">
                <p class="text-xl font-semibold">
                  {{ egp.format(totalRevenue) }}
                </p>
                <p class="text-xs text-muted">
                  {{ egp.format(totalSalesVolume) }} volume
                </p>
              </div>
            </div>
          </template>

          <SalesChart
            :points="monthlyRevenue"
            :format="(value) => egp.format(value)"
          />
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Leads by source</h2>
              <UBadge color="neutral" variant="subtle" size="sm">
                {{ totalContacts }} contacts
              </UBadge>
            </div>
          </template>

          <div class="space-y-4">
            <div v-for="source in leadSources" :key="source.label">
              <div class="mb-1 flex items-center justify-between text-sm">
                <span class="text-muted">{{ source.label }}</span>
                <span class="font-medium">{{ source.count }}</span>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-elevated">
                <div
                  class="h-full rounded-full bg-primary transition-all"
                  :style="{ width: `${source.percent}%` }"
                />
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Recent sales -->
      <UCard class="mt-6">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Recent sales</h2>
            <UButton
              label="View all"
              color="neutral"
              variant="link"
              trailing-icon="i-lucide-arrow-right"
              to="/properties"
            />
          </div>
        </template>

        <UTable :data="recentSales" :columns="salesColumns">
          <template #commission-cell="{ row }">
            <span class="font-medium text-primary">
              {{ row.original.commission }}
            </span>
          </template>
        </UTable>
      </UCard>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { DUMMY_PROPERTIES } from "~/constants/properties/properties";
import type { Property } from "~/types/properties/properties";
import { DUMMY_LEADS } from "~/constants/crm/leads";
import { DUMMY_CONTACTS } from "~/constants/crm/contacts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const egp = new Intl.NumberFormat("en-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

// --- Derived datasets -------------------------------------------------------

// Properties no longer carry a status, so sales metrics are based on purchase
// transactions (everything other than rentals) as a stand-in for closed deals.
const soldProperties = computed(() =>
  DUMMY_PROPERTIES.filter((property) => property.transaction_type !== "Rent"),
);

const commissionOf = (property: Property) =>
  Math.round((property.price * property.commission_scheme) / 100);

const totalRevenue = computed(() =>
  soldProperties.value.reduce(
    (sum, property) => sum + commissionOf(property),
    0,
  ),
);

const totalSalesVolume = computed(() =>
  soldProperties.value.reduce((sum, property) => sum + property.price, 0),
);

const wonLeads = DUMMY_LEADS.filter(
  (lead) => lead.current_state === "Closed Won",
).length;

const activePipeline = DUMMY_LEADS.filter((lead) =>
  ["New", "Warm", "Hot", "In Progress"].includes(lead.current_state),
).length;

const conversionRate = Math.round((wonLeads / DUMMY_LEADS.length) * 100);

// --- Stat cards -------------------------------------------------------------

const stats = computed(() => [
  {
    label: "Revenue (commission)",
    value: egp.format(totalRevenue.value),
    change: "+12.5%",
    icon: "i-lucide-wallet",
    positive: true,
  },
  {
    label: "Units sold",
    value: String(soldProperties.value.length),
    change: "+8.1%",
    icon: "i-lucide-key-round",
    positive: true,
  },
  {
    label: "Active pipeline",
    value: String(activePipeline),
    change: "+4.3%",
    icon: "i-lucide-flame",
    positive: true,
  },
  {
    label: "Conversion",
    value: `${conversionRate}%`,
    change: "-1.2%",
    icon: "i-lucide-trending-up",
    positive: false,
  },
]);

// --- Sales trend chart ------------------------------------------------------
// Distribute sold-unit commission across the last 6 months deterministically
// so the graph stays tied to the real data without needing sale dates.

const monthlyRevenue = computed(() => {
  const buckets = MONTHS.map(() => 0);
  soldProperties.value.forEach((property, index) => {
    buckets[index % MONTHS.length]! += commissionOf(property);
  });
  return MONTHS.map((label, index) => ({ label, value: buckets[index]! }));
});

// --- Recent sales table -----------------------------------------------------

interface RecentSale {
  id: string;
  unit: string;
  location: string;
  type: string;
  agent: string;
  price: string;
  commission: string;
}

const recentSales = computed<RecentSale[]>(() =>
  soldProperties.value.slice(0, 6).map((property) => ({
    id: property.id,
    unit: property.unit_num,
    location: `${property.district}, ${property.city}`,
    type: property.type,
    agent: property.seller_name,
    price: egp.format(property.price),
    commission: egp.format(commissionOf(property)),
  })),
);

const salesColumns = [
  { accessorKey: "unit", header: "Unit" },
  { accessorKey: "location", header: "Location" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "agent", header: "Agent" },
  { accessorKey: "price", header: "Price" },
  { accessorKey: "commission", header: "Commission" },
];

// --- Leads by source breakdown ----------------------------------------------

const leadSources = computed(() => {
  const counts = new Map<string, number>();
  DUMMY_LEADS.forEach((lead) => {
    counts.set(lead.source_type, (counts.get(lead.source_type) ?? 0) + 1);
  });
  const max = Math.max(...counts.values());
  return [...counts.entries()]
    .map(([label, count]) => ({
      label,
      count,
      percent: Math.round((count / max) * 100),
    }))
    .sort((a, b) => b.count - a.count);
});

const totalContacts = DUMMY_CONTACTS.length;
</script>
