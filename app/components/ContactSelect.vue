<script setup lang="ts">
import type { Contact } from "~/constants/dummy/contacts";
import { QUICK_CONTACT_FIELDS, createEmptyState } from "~/constants/forms";

defineProps<{
  placeholder?: string;
}>();

const model = defineModel<string>();

const toast = useToast();
const { contacts, addContact } = useContacts();

const items = computed(() =>
  contacts.value.map((contact) => ({
    label: contact.name,
    value: contact.id,
  })),
);

const modalOpen = ref(false);
const newContact = reactive(createEmptyState(QUICK_CONTACT_FIELDS));

function onCreate(data: Record<string, unknown>) {
  const contact = addContact(data as Partial<Contact>);
  model.value = contact.id;
  modalOpen.value = false;
  Object.assign(newContact, createEmptyState(QUICK_CONTACT_FIELDS));
  toast.add({ title: "Contact created", color: "success" });
}
</script>

<template>
  <div class="flex items-center gap-2">
    <USelectMenu
      v-model="model"
      :items="items"
      value-key="value"
      :placeholder="placeholder ?? 'Select contact…'"
      :search-input="{ placeholder: 'Search contacts…' }"
      class="w-full flex-1"
    />

    <UModal v-model:open="modalOpen" title="New contact">
      <UButton
        icon="i-lucide-plus"
        color="neutral"
        variant="outline"
        square
        aria-label="Create contact"
      />

      <template #body>
        <ResourceForm
          :fields="QUICK_CONTACT_FIELDS"
          :state="newContact"
          submit-label="Add contact"
          :cancel-handler="() => (modalOpen = false)"
          @submit="onCreate"
        />
      </template>
    </UModal>
  </div>
</template>
