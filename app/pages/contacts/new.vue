<template>
  <FormPage panel-id="contacts-new" title="New contact" back-to="/contacts">
    <ResourceForm
      submit-label="Create contact"
      :fields="CONTACT_FIELDS"
      :state="state"
      :loading="loading"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { CONTACT_FIELDS, createEmptyState } from "~/constants/forms";
import type { ContactInput } from "~/composables/useContacts";

const toast = useToast();
const state = reactive(createEmptyState(CONTACT_FIELDS));
const loading = ref(false);

const { createContact } = useContacts();

const onSubmit = async (data: Record<string, unknown>) => {
  loading.value = true;
  try {
    await createContact(data as ContactInput);
    toast.add({ title: "Contact created", color: "success" });
    navigateTo("/contacts");
  } catch {
    toast.add({ title: "Failed to create contact", color: "error" });
  } finally {
    loading.value = false;
  }
};
</script>
