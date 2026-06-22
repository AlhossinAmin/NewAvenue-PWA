<template>
  <FormPage
    panel-id="members-edit"
    back-to="/members"
    :title="record ? `Edit member` : `Member not found`"
  >
    <div
      v-if="!record"
      class="flex flex-col items-center gap-3 py-16 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-10 text-dimmed" />
      <p class="text-sm text-muted">This member does not exist.</p>
      <UButton label="Back to members" to="/members" />
    </div>
    <ResourceForm
      v-else
      submit-label="Save changes"
      :fields="MEMBER_FIELDS"
      :state="state"
      :loading="loading"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { MEMBER_FIELDS } from "~/constants/forms";
import type { MemberInput } from "~/composables/useMembers";

const route = useRoute();
const toast = useToast();

const id = route.params.id as string;
const { fetchMember, updateMember } = useMembers();

const { data: record } = await useAsyncData(`member-${id}`, () =>
  fetchMember(id).catch(() => null),
);

const state = reactive<Record<string, unknown>>({ ...(record.value ?? {}) });
const loading = ref(false);

const onSubmit = async (data: Record<string, unknown>) => {
  loading.value = true;
  try {
    await updateMember(id, data as Partial<MemberInput>);
    toast.add({ title: "Member updated", color: "success" });
    navigateTo("/members");
  } catch {
    toast.add({ title: "Failed to update member", color: "error" });
  } finally {
    loading.value = false;
  }
};
</script>
