<template>
  <FormPage panel-id="leads-edit" back-to="/leads" :title="title">
    <template v-if="record && !isEditing" #actions>
      <UButton
        icon="i-lucide-list-plus"
        label="Log activity"
        color="neutral"
        variant="outline"
        @click="activityModalOpen = true"
      />
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

    <template v-else-if="isEditing">
      <CrmLeadsForm
        :record="record"
        @saved="onSaved"
        @cancel="isEditing = false"
      />
    </template>

    <template v-else>
      <ResourceView :fields="LEAD_FIELDS" :record="record" />

      <USeparator class="my-6" />

      <div class="flex flex-col gap-4">
        <p class="text-sm font-semibold">Activities</p>
        <CrmLeadsActivityHistory ref="historyRef" :lead-id="id" />
      </div>
    </template>

    <CrmLeadsActivityModal
      v-model:open="activityModalOpen"
      :lead-id="id"
      @logged="onActivityLogged"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { LEAD_FIELDS } from "~/constants/common/forms";
import type { CrmLeadsActivityHistory } from "#components";

const route = useRoute();

const id = route.params.id as string;
const { fetchLead } = useLeads();

const { data: record, refresh } = await useAsyncData(`lead-${id}`, () =>
  fetchLead(id).catch(() => null),
);

const isEditing = ref(false);
const activityModalOpen = ref(false);
const historyRef = ref<InstanceType<typeof CrmLeadsActivityHistory> | null>(
  null,
);

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

const onActivityLogged = async () => {
  await refresh();
  historyRef.value?.refresh();
};
</script>
