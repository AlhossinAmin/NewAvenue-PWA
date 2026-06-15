<template>
  <FormPage panel-id="leads-new" title="New lead" back-to="/leads">
    <ResourceForm
      :fields="LEAD_FIELDS"
      :state="state"
      submit-label="Create lead"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { LEAD_FIELDS, createEmptyState } from "~/constants/forms";

const toast = useToast();
const state = reactive(createEmptyState(LEAD_FIELDS));

const onSubmit = () => {
  // Dummy data is static — surface success and return to the list.
  toast.add({ title: "Lead created", color: "success" });
  navigateTo("/leads");
}
</script>
