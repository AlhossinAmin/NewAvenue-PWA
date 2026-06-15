<template>
  <FormPage
    panel-id="projects-edit"
    :title="record ? `Edit project` : `Project not found`"
    back-to="/projects"
  >
    <div
      v-if="!record"
      class="flex flex-col items-center gap-3 py-16 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-10 text-dimmed" />
      <p class="text-sm text-muted">This project does not exist.</p>
      <UButton label="Back to projects" to="/projects" />
    </div>
    <ResourceForm
      v-else
      :fields="PROJECT_FIELDS"
      :state="state"
      submit-label="Save changes"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { PROJECT_FIELDS } from "~/constants/forms";
import { DUMMY_PROJECTS } from "~/constants/dummy/projects";

const route = useRoute();
const toast = useToast();

const record = DUMMY_PROJECTS.find((item) => item.id === route.params.id);
const state = reactive<Record<string, unknown>>({ ...(record ?? {}) });

const onSubmit = () => {
  // Dummy data is static — surface success and return to the list.
  toast.add({ title: "Project updated", color: "success" });
  navigateTo("/projects");
}
</script>
