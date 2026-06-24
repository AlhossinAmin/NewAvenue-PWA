<template>
  <FormPage panel-id="members-edit" back-to="/members" :title="title">
    <template v-if="record && !isEditing" #actions>
      <UButton icon="i-lucide-pencil" label="Edit" @click="isEditing = true" />
    </template>

    <div
      v-if="!record"
      class="flex flex-col items-center gap-3 py-16 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-10 text-dimmed" />
      <p class="text-sm text-muted">This member does not exist.</p>
      <UButton label="Back to members" to="/members" />
    </div>

    <HrMembersForm
      v-else-if="isEditing"
      :record="record"
      @saved="onSaved"
      @cancel="isEditing = false"
    />
    <ResourceView v-else :fields="MEMBER_FIELDS" :record="record" />
  </FormPage>
</template>

<script setup lang="ts">
import { MEMBER_FIELDS } from "~/constants/common/forms";

const route = useRoute();

const id = route.params.id as string;
const { fetchMember } = useMembers();

const { data: record, refresh } = await useAsyncData(`member-${id}`, () =>
  fetchMember(id).catch(() => null),
);

const isEditing = ref(false);

const title = computed(() =>
  record.value
    ? isEditing.value
      ? "Edit member"
      : "Member details"
    : "Member not found",
);

const onSaved = async () => {
  await refresh();
  isEditing.value = false;
};
</script>
