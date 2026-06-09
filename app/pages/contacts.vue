<script setup lang="ts">
const contacts = [
  {
    name: "Olivia Martin",
    email: "olivia@example.com",
    phone: "+971 50 123 4567",
  },
  {
    name: "Jackson Lee",
    email: "jackson@example.com",
    phone: "+971 52 987 6543",
  },
  {
    name: "Sofia Davis",
    email: "sofia@example.com",
    phone: "+971 55 555 1212",
  },
];

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Phone" },
];
</script>

<template>
  <ResourcePage
    panel-id="contacts"
    title="Contacts"
    icon="i-lucide-contact"
    new-label="New contact"
  >
    <UTable :data="contacts" :columns="columns" />
  </ResourcePage>
</template>
