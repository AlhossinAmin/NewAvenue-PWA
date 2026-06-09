<script setup lang="ts">
import { PROJECT_FIELDS, createEmptyState } from "~/constants/forms";

const toast = useToast();
const state = reactive(createEmptyState(PROJECT_FIELDS));

function onSubmit() {
  // Dummy data is static — surface success and return to the list.
  toast.add({ title: "Project created", color: "success" });
  navigateTo("/projects");
}
</script>

<template>
  <FormPage panel-id="projects-new" title="New project" back-to="/projects">
    <ResourceForm
      :fields="PROJECT_FIELDS"
      :state="state"
      submit-label="Create project"
      @submit="onSubmit"
    />
  </FormPage>
</template>
