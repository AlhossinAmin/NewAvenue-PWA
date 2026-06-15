<template>
  <FormPage
    panel-id="contacts-edit"
    :title="record ? `Edit contact` : `Contact not found`"
    back-to="/contacts"
  >
    <div
      v-if="!record"
      class="flex flex-col items-center gap-3 py-16 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-10 text-dimmed" />
      <p class="text-sm text-muted">This contact does not exist.</p>
      <UButton label="Back to contacts" to="/contacts" />
    </div>
    <ResourceForm
      v-else
      :fields="CONTACT_FIELDS"
      :state="state"
      submit-label="Save changes"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { CONTACT_FIELDS } from "~/constants/forms";
import { DUMMY_CONTACTS } from "~/constants/dummy/contacts";

const route = useRoute();
const toast = useToast();

const record = DUMMY_CONTACTS.find((item) => item.id === route.params.id);
const state = reactive<Record<string, unknown>>({ ...(record ?? {}) });

const onSubmit = () => {
  // Dummy data is static — surface success and return to the list.
  toast.add({ title: "Contact updated", color: "success" });
  navigateTo("/contacts");
}
</script>
