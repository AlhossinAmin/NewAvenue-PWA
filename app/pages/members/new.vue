<template>
  <FormPage panel-id="members-new" title="New member" back-to="/members">
    <ResourceForm
      :fields="MEMBER_FIELDS"
      :state="state"
      submit-label="Create member"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { MEMBER_FIELDS, createEmptyState } from "~/constants/forms";

const toast = useToast();
const state = reactive(createEmptyState(MEMBER_FIELDS));

const onSubmit = () => {
  // Dummy data is static — surface success and return to the list.
  toast.add({ title: "Member created", color: "success" });
  navigateTo("/members");
}
</script>
