<template>
  <FormPage
    panel-id="properties-new"
    title="New property"
    back-to="/properties"
  >
    <ResourceForm
      :fields="PROPERTY_FIELDS"
      :state="state"
      submit-label="Create property"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { PROPERTY_FIELDS, createEmptyState } from "~/constants/forms";

const toast = useToast();
const state = reactive(createEmptyState(PROPERTY_FIELDS));

const onSubmit = () => {
  // Dummy data is static — surface success and return to the list.
  toast.add({ title: "Property created", color: "success" });
  navigateTo("/properties");
}
</script>
