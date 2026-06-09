<script setup lang="ts">
const leads = [
  { name: "Isabella Nguyen", source: "Website", status: "new" },
  { name: "William Kim", source: "Referral", status: "contacted" },
  { name: "Ava Thompson", source: "Campaign", status: "qualified" },
];

const statusColor = {
  new: "info",
  contacted: "warning",
  qualified: "success",
} as const;

const columns = [
  { accessorKey: "name", header: "Lead" },
  { accessorKey: "source", header: "Source" },
  { accessorKey: "status", header: "Status" },
];
</script>

<template>
  <ResourcePage
    panel-id="leads"
    title="Leads"
    icon="i-lucide-user-plus"
    new-label="New lead"
  >
    <UTable :data="leads" :columns="columns">
      <template #status-cell="{ row }">
        <UBadge
          :color="statusColor[row.original.status as keyof typeof statusColor]"
          variant="subtle"
          class="capitalize"
        >
          {{ row.original.status }}
        </UBadge>
      </template>
    </UTable>
  </ResourcePage>
</template>
