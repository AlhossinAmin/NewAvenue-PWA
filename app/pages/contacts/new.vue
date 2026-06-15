<template>
  <FormPage panel-id="contacts-new" title="New contact" back-to="/contacts">
    <ResourceForm
      :fields="CONTACT_FIELDS"
      :state="state"
      submit-label="Create contact"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { CONTACT_FIELDS, createEmptyState } from "~/constants/forms";

const toast = useToast();
const state = reactive(createEmptyState(CONTACT_FIELDS));

const onSubmit = () => {
  // Dummy data is static — surface success and return to the list.
  toast.add({ title: "Contact created", color: "success" });
  navigateTo("/contacts");
}
</script>
