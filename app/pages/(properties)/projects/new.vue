<template>
  <FormPage panel-id="projects-new" title="New project" back-to="/projects">
    <ResourceForm
      submit-label="Create project"
      :fields="PROJECT_FIELDS"
      :state="state"
      :loading="loading"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { PROJECT_FIELDS, createEmptyState } from "~/constants/common/forms";
import type { ProjectInput } from "~/composables/properties/useProjects";

const toast = useToast();
const state = reactive(createEmptyState(PROJECT_FIELDS));
const loading = ref(false);

const { createProject } = useProjects();

const onSubmit = async (data: Record<string, unknown>) => {
  loading.value = true;
  try {
    await createProject(data as ProjectInput);
    toast.add({ title: "Project created", color: "success" });
    navigateTo("/projects");
  } catch {
    toast.add({ title: "Failed to create project", color: "error" });
  } finally {
    loading.value = false;
  }
};
</script>
