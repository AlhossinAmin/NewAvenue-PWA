<script setup lang="ts">
import { LEAD_FIELDS } from "~/constants/forms";
import { DUMMY_LEADS } from "~/constants/dummy/leads";

const route = useRoute();
const toast = useToast();

const record = DUMMY_LEADS.find((item) => item.id === route.params.id);
const state = reactive<Record<string, unknown>>({ ...(record ?? {}) });

function onSubmit() {
  // Dummy data is static — surface success and return to the list.
  toast.add({ title: "Lead updated", color: "success" });
  navigateTo("/leads");
}
</script>

<template>
  <FormPage
    panel-id="leads-edit"
    :title="record ? `Edit lead` : `Lead not found`"
    back-to="/leads"
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
      :fields="LEAD_FIELDS"
      :state="state"
      submit-label="Save changes"
      @submit="onSubmit"
    />
  </FormPage>
</template>
