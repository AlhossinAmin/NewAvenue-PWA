<script setup lang="ts">
import { DEVELOPER_FIELDS, createEmptyState } from "~/constants/forms";

const toast = useToast();
const state = reactive(createEmptyState(DEVELOPER_FIELDS));

function onSubmit() {
  // Dummy data is static — surface success and return to the list.
  toast.add({ title: "Developer created", color: "success" });
  navigateTo("/developers");
}
</script>

<template>
  <FormPage
    panel-id="developers-new"
    title="New developer"
    back-to="/developers"
  >
    <ResourceForm
      :fields="DEVELOPER_FIELDS"
      :state="state"
      submit-label="Create developer"
      @submit="onSubmit"
    />
  </FormPage>
</template>
