<template>
  <FormPage panel-id="leads-edit" back-to="/leads" :title="title">
    <template v-if="record && !isEditing" #actions>
      <UButton icon="i-lucide-pencil" label="Edit" @click="isEditing = true" />
    </template>

    <div
      v-if="!record"
      class="flex flex-col items-center gap-3 py-16 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-10 text-dimmed" />
      <p class="text-sm text-muted">This lead does not exist.</p>
      <UButton label="Back to leads" to="/leads" />
    </div>

    <CrmLeadsForm
      v-else-if="isEditing"
      :record="record"
      @saved="onSaved"
      @cancel="isEditing = false"
    />
    <ResourceView v-else :fields="LEAD_FIELDS" :record="record" />
  </FormPage>
</template>

<script setup lang="ts">
import { LEAD_FIELDS } from "~/constants/common/forms";

const route = useRoute();

const id = route.params.id as string;
const { fetchLead } = useLeads();

const { data: record, refresh } = await useAsyncData(`lead-${id}`, () =>
  fetchLead(id).catch(() => null),
);

const isEditing = ref(false);

const title = computed(() =>
  record.value
    ? isEditing.value
      ? "Edit lead"
      : "Lead details"
    : "Lead not found",
);

const onSaved = async () => {
  await refresh();
  isEditing.value = false;
};
</script>
