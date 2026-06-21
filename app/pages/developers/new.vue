<template>
  <FormPage
    panel-id="developers-new"
    title="New developer"
    back-to="/developers"
  >
    <ResourceForm
      submit-label="Create developer"
      :fields="DEVELOPER_FIELDS"
      :state="state"
      :loading="loading"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { DEVELOPER_FIELDS, createEmptyState } from "~/constants/forms";
import type { DeveloperInput } from "~/composables/useDevelopers";

const toast = useToast();
const state = reactive(createEmptyState(DEVELOPER_FIELDS));
const loading = ref(false);

const { createDeveloper } = useDevelopers();

const onSubmit = async (data: Record<string, unknown>) => {
  loading.value = true;
  try {
    await createDeveloper(data as DeveloperInput);
    toast.add({ title: "Developer created", color: "success" });
    navigateTo("/developers");
  } catch {
    toast.add({ title: "Failed to create developer", color: "error" });
  } finally {
    loading.value = false;
  }
};
</script>
