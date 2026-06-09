<script setup lang="ts">
import { MEMBER_FIELDS } from "~/constants/forms";
import { DUMMY_MEMBERS } from "~/constants/dummy/members";

const route = useRoute();
const toast = useToast();

const record = DUMMY_MEMBERS.find((item) => item.id === route.params.id);
const state = reactive<Record<string, unknown>>({ ...(record ?? {}) });

function onSubmit() {
  // Dummy data is static — surface success and return to the list.
  toast.add({ title: "Member updated", color: "success" });
  navigateTo("/members");
}
</script>

<template>
  <FormPage
    panel-id="members-edit"
    :title="record ? `Edit member` : `Member not found`"
    back-to="/members"
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
      :fields="MEMBER_FIELDS"
      :state="state"
      submit-label="Save changes"
      @submit="onSubmit"
    />
  </FormPage>
</template>
