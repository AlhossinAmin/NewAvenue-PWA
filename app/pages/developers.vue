<script setup lang="ts">
const developers = [
  { name: "Skyline Developments", projects: 12, city: "Dubai" },
  { name: "Coastal Estates", projects: 5, city: "Abu Dhabi" },
  { name: "Urban Living Co.", projects: 8, city: "Sharjah" },
];

const columns = [
  { accessorKey: "name", header: "Developer" },
  { accessorKey: "projects", header: "Projects" },
  { accessorKey: "city", header: "City" },
];
</script>

<template>
  <ResourcePage
    panel-id="developers"
    title="Developers"
    icon="i-lucide-building-2"
    new-label="New developer"
  >
    <UTable :data="developers" :columns="columns" />
  </ResourcePage>
</template>
