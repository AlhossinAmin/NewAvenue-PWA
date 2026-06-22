<template>
  <UForm
    class="flex flex-col gap-6"
    :state="state"
    :validate="validate"
    @submit="onSubmit"
  >
    <div class="flex flex-col gap-4">
      <UFormField
        v-for="field in visibleFields"
        :key="field.key"
        :label="field.label"
        :name="field.key"
        :required="field.required"
      >
        <CrmContactsSelect
          v-if="field.type === 'contact'"
          v-model="state[field.key] as string"
          :placeholder="field.placeholder"
        />
        <PropertiesProjectsSelect
          v-else-if="field.type === 'project'"
          v-model="state[field.key] as string"
          :placeholder="field.placeholder"
        />
        <PropertiesDevelopersSelect
          v-else-if="field.type === 'developer'"
          v-model="state[field.key] as string"
          :placeholder="field.placeholder"
        />
        <AgentSelect
          v-else-if="field.type === 'agent'"
          v-model="state[field.key] as string"
          :placeholder="field.placeholder"
        />
        <ImageInput
          v-else-if="field.type === 'image'"
          v-model="state[field.key] as string"
          :label="field.label"
          :placeholder="field.placeholder"
        />
        <ImagesInput
          v-else-if="field.type === 'images'"
          v-model="state[field.key] as string[]"
          :label="field.label"
          :placeholder="field.placeholder"
        />
        <PhonesInput
          v-else-if="field.type === 'phones'"
          v-model="state[field.key] as PhoneNumber[]"
          :placeholder="field.placeholder"
        />
        <USwitch
          v-else-if="field.type === 'switch'"
          v-model="state[field.key] as boolean"
        />
        <UTextarea
          v-else-if="field.type === 'textarea'"
          v-model="state[field.key] as string"
          class="w-full"
          :placeholder="field.placeholder"
          :rows="3"
        />
        <USelect
          v-else-if="field.type === 'select'"
          v-model="state[field.key] as string"
          class="w-full"
          :items="field.options ?? []"
          :placeholder="field.placeholder ?? 'Select…'"
        />
        <ComboboxInput
          v-else-if="field.type === 'combobox'"
          v-model="state[field.key] as string"
          :options="field.options"
          :placeholder="field.placeholder"
        />
        <USelectMenu
          v-else-if="field.type === 'multiselect'"
          v-model="state[field.key] as string[]"
          multiple
          class="w-full"
          :items="field.options ?? []"
          :placeholder="field.placeholder ?? 'Select…'"
        />
        <UInputTags
          v-else-if="field.type === 'tags'"
          v-model="state[field.key] as string[]"
          class="w-full"
          :placeholder="field.placeholder"
        />
        <UInput
          v-else-if="field.type === 'number'"
          v-model.number="state[field.key] as number"
          type="number"
          class="w-full"
          :placeholder="field.placeholder"
        />
        <UInput
          v-else-if="field.type === 'date'"
          v-model="state[field.key] as string"
          type="date"
          class="w-full"
        />
        <UInput
          v-else-if="field.type === 'computed'"
          readonly
          disabled
          placeholder="Auto-generated"
          class="w-full"
          :model-value="state[field.key] as string"
        />
        <UInput
          v-else
          v-model="state[field.key] as string"
          class="w-full"
          :type="field.type"
          :placeholder="field.placeholder"
        />
      </UFormField>
    </div>

    <div class="flex items-center justify-end gap-2">
      <UButton
        label="Cancel"
        color="neutral"
        variant="ghost"
        @click="$router.back()"
      />
      <UButton
        type="submit"
        icon="i-lucide-check"
        :label="submitLabel"
        :loading="loading"
      />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  PROJECT_FIELDS,
  createEmptyState,
  type PhoneNumber,
} from "~/constants/common/forms";
import type { ProjectInput } from "~/composables/properties/useProjects";
import type { Project } from "~/types/properties/projects";

const props = defineProps<{
  // Omit (or null) to create; pass a project to edit it.
  record?: Project | null;
}>();

const toast = useToast();
const { createProject, updateProject } = useProjects();

// The API returns `developer` as a { id, name } object, but the form (and the
// update payload) work with the developer's UUID — seed it from `developer.id`.
const state = reactive<Record<string, unknown>>(
  props.record
    ? { ...props.record, developer: props.record.developer?.id ?? "" }
    : createEmptyState(PROJECT_FIELDS),
);
const loading = ref(false);

const { visibleFields, validate } = useResourceForm(PROJECT_FIELDS, state);

const submitLabel = computed(() =>
  props.record ? "Save changes" : "Create project",
);

const onSubmit = async (event: FormSubmitEvent<Record<string, unknown>>) => {
  loading.value = true;
  try {
    if (props.record) {
      await updateProject(props.record.id, event.data as Partial<ProjectInput>);
      toast.add({ title: "Project updated", color: "success" });
    } else {
      await createProject(event.data as ProjectInput);
      toast.add({ title: "Project created", color: "success" });
    }
    navigateTo("/projects");
  } catch {
    toast.add({
      title: props.record
        ? "Failed to update project"
        : "Failed to create project",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};
</script>
