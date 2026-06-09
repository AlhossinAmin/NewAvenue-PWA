<script setup lang="ts">
const roles = [
  { name: "Administrator", members: 2, permissions: "Full access" },
  { name: "Agent", members: 14, permissions: "Properties, Leads" },
  { name: "Viewer", members: 6, permissions: "Read only" },
];

const columns = [
  { accessorKey: "name", header: "Role" },
  { accessorKey: "members", header: "Members" },
  { accessorKey: "permissions", header: "Permissions" },
];
</script>

<template>
  <ResourcePage
    panel-id="roles"
    title="Roles"
    icon="i-lucide-shield"
    new-label="New role"
  >
    <UTable :data="roles" :columns="columns" />
  </ResourcePage>
</template>
