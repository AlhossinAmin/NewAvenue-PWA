<script setup lang="ts">
const members = [
  { name: "Admin User", role: "Administrator", email: "admin@34ml.com" },
  { name: "Liam Carter", role: "Agent", email: "liam@example.com" },
  { name: "Mia Patel", role: "Viewer", email: "mia@example.com" },
];

const columns = [
  { accessorKey: "name", header: "Member" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "email", header: "Email" },
];
</script>

<template>
  <ResourcePage
    panel-id="members"
    title="Members"
    icon="i-lucide-users"
    new-label="Invite member"
  >
    <UTable :data="members" :columns="columns" />
  </ResourcePage>
</template>
