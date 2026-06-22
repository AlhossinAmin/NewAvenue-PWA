<template>
  <FormPage
    panel-id="projects-edit"
    back-to="/projects"
    :title="record ? `Edit project` : `Project not found`"
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
      submit-label="Save changes"
      :fields="PROJECT_FIELDS"
      :state="state"
      :loading="loading"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { PROJECT_FIELDS } from "~/constants/common/forms";
import type { ProjectInput } from "~/composables/properties/useProjects";

const route = useRoute();
const toast = useToast();

const id = route.params.id as string;
const { fetchProject, updateProject } = useProjects();

const { data: record } = await useAsyncData(`project-${id}`, () =>
  fetchProject(id).catch(() => null),
);

// The API returns `developer` as a { id, name } object, but the form (and the
// update payload) work with the developer's UUID — seed it from `developer.id`.
const state = reactive<Record<string, unknown>>({
  ...(record.value ?? {}),
  developer: record.value?.developer?.id ?? "",
});
const loading = ref(false);

const onSubmit = async (data: Record<string, unknown>) => {
  loading.value = true;
  try {
    await updateProject(id, data as Partial<ProjectInput>);
    toast.add({ title: "Project updated", color: "success" });
    navigateTo("/projects");
  } catch {
    toast.add({ title: "Failed to update project", color: "error" });
  } finally {
    loading.value = false;
  }
};
</script>
