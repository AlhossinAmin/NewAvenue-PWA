<template>
  <FormPage panel-id="leads-new" title="New lead" back-to="/leads">
    <ResourceForm
      submit-label="Create lead"
      :fields="LEAD_FIELDS"
      :state="state"
      :loading="loading"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { LEAD_FIELDS, createEmptyState } from "~/constants/common/forms";
import type { LeadInput } from "~/composables/crm/useLeads";

const toast = useToast();
const state = reactive(createEmptyState(LEAD_FIELDS));
const loading = ref(false);

const { createLead } = useLeads();

const onSubmit = async (data: Record<string, unknown>) => {
  loading.value = true;
  try {
    await createLead(data as LeadInput);
    toast.add({ title: "Lead created", color: "success" });
    navigateTo("/leads");
  } catch {
    toast.add({ title: "Failed to create lead", color: "error" });
  } finally {
    loading.value = false;
  }
};
</script>
