<template>
  <USelectMenu
    v-model="model"
    :items="items"
    value-key="value"
    :placeholder="placeholder ?? 'Select project…'"
    :search-input="{ placeholder: 'Search projects…' }"
    class="w-full"
  />
</template>

<script setup lang="ts">
import { DUMMY_PROJECTS } from "~/constants/dummy/projects";

defineProps<{
  placeholder?: string;
}>();

// Stores the linked project's id; the dropdown shows its name.
const model = defineModel<string>();

const items = DUMMY_PROJECTS.map((project) => ({
  label: project.name,
  value: project.id,
}));
</script>
