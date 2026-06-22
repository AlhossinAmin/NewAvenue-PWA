<template>
  <FormPage
    panel-id="properties-new"
    title="New property"
    back-to="/properties"
  >
    <ResourceForm
      submit-label="Create property"
      :fields="PROPERTY_FIELDS"
      :state="state"
      :loading="loading"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { PROPERTY_FIELDS, createEmptyState } from "~/constants/common/forms";
import type { PropertyInput } from "~/composables/properties/useProperties";

const toast = useToast();
const state = reactive(createEmptyState(PROPERTY_FIELDS));
const loading = ref(false);

const { createProperty } = useProperties();

const onSubmit = async (data: Record<string, unknown>) => {
  loading.value = true;
  try {
    await createProperty(data as PropertyInput);
    toast.add({ title: "Property created", color: "success" });
    navigateTo("/properties");
  } catch {
    toast.add({ title: "Failed to create property", color: "error" });
  } finally {
    loading.value = false;
  }
};
</script>
