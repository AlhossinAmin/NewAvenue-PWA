<script setup lang="ts">
const stats = [
  {
    label: "Revenue",
    value: "$48,200",
    change: "+12.5%",
    icon: "i-lucide-dollar-sign",
    positive: true,
  },
  {
    label: "Customers",
    value: "1,842",
    change: "+5.2%",
    icon: "i-lucide-users",
    positive: true,
  },
  {
    label: "Orders",
    value: "624",
    change: "-2.1%",
    icon: "i-lucide-shopping-cart",
    positive: false,
  },
  {
    label: "Conversion",
    value: "3.4%",
    change: "+0.8%",
    icon: "i-lucide-trending-up",
    positive: true,
  },
];

type Order = {
  id: string;
  customer: string;
  status: "paid" | "pending" | "failed";
  amount: string;
  date: string;
};

const orders: Order[] = [
  {
    id: "#3201",
    customer: "Olivia Martin",
    status: "paid",
    amount: "$320.00",
    date: "2026-06-08",
  },
  {
    id: "#3200",
    customer: "Jackson Lee",
    status: "pending",
    amount: "$74.50",
    date: "2026-06-08",
  },
  {
    id: "#3199",
    customer: "Isabella Nguyen",
    status: "paid",
    amount: "$1,240.00",
    date: "2026-06-07",
  },
  {
    id: "#3198",
    customer: "William Kim",
    status: "failed",
    amount: "$89.00",
    date: "2026-06-07",
  },
  {
    id: "#3197",
    customer: "Sofia Davis",
    status: "paid",
    amount: "$540.00",
    date: "2026-06-06",
  },
];

const statusColor = {
  paid: "success",
  pending: "warning",
  failed: "error",
} as const;

const columns = [
  { accessorKey: "id", header: "Order" },
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "amount", header: "Amount" },
  { accessorKey: "date", header: "Date" },
];
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Dashboard" icon="i-lucide-house">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-bell"
            color="neutral"
            variant="ghost"
            square
          />
          <UButton icon="i-lucide-plus" label="New order" color="primary" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageGrid class="lg:grid-cols-4">
        <UPageCard
          v-for="stat in stats"
          :key="stat.label"
          :icon="stat.icon"
          :title="stat.label"
          variant="subtle"
        >
          <div class="flex items-end justify-between gap-2">
            <span class="text-2xl font-semibold">{{ stat.value }}</span>
            <UBadge
              :color="stat.positive ? 'success' : 'error'"
              variant="subtle"
              size="sm"
            >
              {{ stat.change }}
            </UBadge>
          </div>
        </UPageCard>
      </UPageGrid>

      <UCard class="mt-6">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Recent orders</h2>
            <UButton
              label="View all"
              color="neutral"
              variant="link"
              trailing-icon="i-lucide-arrow-right"
            />
          </div>
        </template>

        <UTable :data="orders" :columns="columns">
          <template #status-cell="{ row }">
            <UBadge
              :color="statusColor[row.original.status]"
              variant="subtle"
              class="capitalize"
            >
              {{ row.original.status }}
            </UBadge>
          </template>
        </UTable>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
