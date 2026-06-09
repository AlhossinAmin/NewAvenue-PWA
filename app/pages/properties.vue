<script setup lang="ts">
const properties = [
  {
    ref: "PR-1001",
    type: "Apartment",
    project: "Marina Heights",
    price: "$420,000",
  },
  {
    ref: "PR-1002",
    type: "Villa",
    project: "Palm Residences",
    price: "$1,250,000",
  },
  {
    ref: "PR-1003",
    type: "Townhouse",
    project: "City Gardens",
    price: "$680,000",
  },
];

const columns = [
  { accessorKey: "ref", header: "Ref" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "project", header: "Project" },
  { accessorKey: "price", header: "Price" },
];
</script>

<template>
  <ResourcePage
    panel-id="properties"
    title="Properties"
    icon="i-lucide-home"
    new-label="New property"
  >
    <UTable :data="properties" :columns="columns" />
  </ResourcePage>
</template>
