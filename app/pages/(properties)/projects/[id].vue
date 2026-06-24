<template>
  <FormPage panel-id="projects-edit" back-to="/projects" :title="title">
    <template v-if="record && !isEditing" #actions>
      <UButton icon="i-lucide-pencil" label="Edit" @click="isEditing = true" />
    </template>

    <div
      v-if="!record"
      class="flex flex-col items-center gap-3 py-16 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-10 text-dimmed" />
      <p class="text-sm text-muted">This project does not exist.</p>
      <UButton label="Back to projects" to="/projects" />
    </div>

    <PropertiesProjectsForm
      v-else-if="isEditing"
      :record="record"
      @saved="onSaved"
      @cancel="isEditing = false"
    />
    <ResourceView v-else :fields="PROJECT_VIEW_FIELDS" :record="record" />
  </FormPage>
</template>

<script setup lang="ts">
import type { FormField } from "~/constants/common/forms";

const route = useRoute();

const id = route.params.id as string;
const { fetchProject } = useProjects();

const { data: record, refresh } = await useAsyncData(`project-${id}`, () =>
  fetchProject(id).catch(() => null),
);

const isEditing = ref(false);

const PROJECT_VIEW_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "developer", label: "Developer", type: "developer" },
  { key: "country", label: "Country", type: "text" },
  { key: "city", label: "City", type: "text" },
  { key: "district", label: "District", type: "text" },
  { key: "category", label: "Category", type: "multiselect" },
  { key: "commission_scheme", label: "Commission (%)", type: "number" },
  { key: "resale_units_sold", label: "Resale units sold", type: "number" },
  {
    key: "resale_units_remaining",
    label: "Resale units remaining",
    type: "number",
  },
  { key: "photos", label: "Photos", type: "photos", full: true },
  { key: "description", label: "Description", type: "textarea", full: true },
];

const title = computed(() =>
  record.value
    ? isEditing.value
      ? "Edit project"
      : "Project details"
    : "Project not found",
);

const onSaved = async () => {
  await refresh();
  isEditing.value = false;
};
</script>
