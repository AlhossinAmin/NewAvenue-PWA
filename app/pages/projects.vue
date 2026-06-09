<script setup lang="ts">
const projects = [
  { name: "Marina Heights", developer: "Skyline Developments", units: 240 },
  { name: "Palm Residences", developer: "Coastal Estates", units: 96 },
  { name: "City Gardens", developer: "Urban Living Co.", units: 150 },
];

const columns = [
  { accessorKey: "name", header: "Project" },
  { accessorKey: "developer", header: "Developer" },
  { accessorKey: "units", header: "Units" },
];
</script>

<template>
  <ResourcePage
    panel-id="projects"
    title="Projects"
    icon="i-lucide-layout-grid"
    new-label="New project"
  >
    <UTable :data="projects" :columns="columns" />
  </ResourcePage>
</template>
