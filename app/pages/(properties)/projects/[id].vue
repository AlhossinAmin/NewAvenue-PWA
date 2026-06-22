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

    <PropertiesProjectsForm v-else :record="record" />
  </FormPage>
</template>

<script setup lang="ts">
const route = useRoute();

const id = route.params.id as string;
const { fetchProject } = useProjects();

const { data: record } = await useAsyncData(`project-${id}`, () =>
  fetchProject(id).catch(() => null),
);
</script>
