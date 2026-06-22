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

    <CrmLeadsForm v-else :record="record" />
  </FormPage>
</template>

<script setup lang="ts">
const route = useRoute();

const id = route.params.id as string;
const { fetchLead } = useLeads();

const { data: record } = await useAsyncData(`lead-${id}`, () =>
  fetchLead(id).catch(() => null),
);
</script>
