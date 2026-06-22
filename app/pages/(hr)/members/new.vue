<template>
  <FormPage panel-id="members-new" title="New member" back-to="/members">
    <ResourceForm
      submit-label="Create member"
      :fields="MEMBER_FIELDS"
      :state="state"
      :loading="loading"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { MEMBER_FIELDS, createEmptyState } from "~/constants/common/forms";
import type { MemberInput } from "~/composables/hr/useMembers";

const toast = useToast();
const state = reactive(createEmptyState(MEMBER_FIELDS));
const loading = ref(false);

const { createMember } = useMembers();

const onSubmit = async (data: Record<string, unknown>) => {
  loading.value = true;
  try {
    await createMember(data as MemberInput);
    toast.add({ title: "Member created", color: "success" });
    navigateTo("/members");
  } catch {
    toast.add({ title: "Failed to create member", color: "error" });
  } finally {
    loading.value = false;
  }
};
</script>
