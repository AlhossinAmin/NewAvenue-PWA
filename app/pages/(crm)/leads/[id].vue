<template>
  <FormPage
    panel-id="leads-edit"
    back-to="/leads"
    :title="record ? `Edit lead` : `Lead not found`"
  >
    <div
      v-if="!record"
      class="flex flex-col items-center gap-3 py-16 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-10 text-dimmed" />
      <p class="text-sm text-muted">This lead does not exist.</p>
      <UButton label="Back to leads" to="/leads" />
    </div>
    <ResourceForm
      v-else
      submit-label="Save changes"
      :fields="LEAD_FIELDS"
      :state="state"
      :loading="loading"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { LEAD_FIELDS } from "~/constants/common/forms";
import type { LeadInput } from "~/composables/crm/useLeads";

const route = useRoute();
const toast = useToast();

const id = route.params.id as string;
const { fetchLead, updateLead } = useLeads();

const { data: record } = await useAsyncData(`lead-${id}`, () =>
  fetchLead(id).catch(() => null),
);

// The API returns `customer` and `assigned_agent` as { id, name } objects, but
// the form (and the update payload) work with their UUIDs — seed from `*.id`.
const state = reactive<Record<string, unknown>>({
  ...(record.value ?? {}),
  customer: record.value?.customer?.id ?? "",
  assigned_agent: record.value?.assigned_agent?.id ?? "",
});
const loading = ref(false);

const onSubmit = async (data: Record<string, unknown>) => {
  loading.value = true;
  try {
    await updateLead(id, data as Partial<LeadInput>);
    toast.add({ title: "Lead updated", color: "success" });
    navigateTo("/leads");
  } catch {
    toast.add({ title: "Failed to update lead", color: "error" });
  } finally {
    loading.value = false;
  }
};
</script>
