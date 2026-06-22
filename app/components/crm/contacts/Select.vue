<template>
  <div class="flex items-center gap-2">
    <USelectMenu
      v-model="model"
      v-model:search-term="searchTerm"
      value-key="value"
      ignore-filter
      class="w-full flex-1"
      :items="items"
      :loading="loading"
      :placeholder="placeholder ?? 'Select contact…'"
      :search-input="{ placeholder: 'Search contacts…' }"
      @update:open="onOpen"
    >
      <template #item-label="{ item }">
        {{ item.label }}
        <span
          v-if="item.value === lastItemValue"
          class="sr-only"
          :ref="setSentinel"
        />
      </template>
    </USelectMenu>

    <UModal v-model:open="modalOpen" title="New contact">
      <UButton
        icon="i-lucide-plus"
        color="neutral"
        variant="outline"
        square
        aria-label="Create contact"
      />

      <template #body>
        <UForm
          class="flex flex-col gap-6"
          :state="newContact"
          :validate="validate"
          @submit="onCreate"
        >
          <div class="flex flex-col gap-4">
            <UFormField
              v-for="field in visibleFields"
              :key="field.key"
              :label="field.label"
              :name="field.key"
              :required="field.required"
            >
              <PhonesInput
                v-if="field.type === 'phones'"
                v-model="newContact[field.key] as PhoneNumber[]"
                :placeholder="field.placeholder"
              />
              <USelect
                v-else-if="field.type === 'select'"
                v-model="newContact[field.key] as string"
                class="w-full"
                :items="field.options ?? []"
                :placeholder="field.placeholder ?? 'Select…'"
              />
              <UInput
                v-else-if="field.type === 'number'"
                v-model.number="newContact[field.key] as number"
                type="number"
                class="w-full"
                :placeholder="field.placeholder"
              />
              <UInput
                v-else
                v-model="newContact[field.key] as string"
                class="w-full"
                :type="field.type"
                :placeholder="field.placeholder"
              />
            </UFormField>
          </div>

          <div class="flex items-center justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              @click="modalOpen = false"
            />
            <UButton
              type="submit"
              icon="i-lucide-check"
              label="Add contact"
              :loading="creating"
            />
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Contact } from "~/types/crm/contacts";
import type { ContactInput } from "~/composables/crm/useContacts";
import {
  QUICK_CONTACT_FIELDS,
  createEmptyState,
  type PhoneNumber,
} from "~/constants/common/forms";

defineProps<{
  placeholder?: string;
}>();

// Stores the selected contact's id; the dropdown shows its name.
const model = defineModel<string>();

const toast = useToast();
const { fetchContacts, fetchContact, createContact } = useContacts();

const contacts = ref<Contact[]>([]);
const preselected = ref<Contact | null>(null);
const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);
const opened = ref(false);
const searchTerm = ref("");

const modalOpen = ref(false);
const creating = ref(false);
const newContact = reactive(createEmptyState(QUICK_CONTACT_FIELDS));

const { visibleFields, validate } = useResourceForm(
  QUICK_CONTACT_FIELDS,
  newContact,
);

const items = computed(() => {
  const list = contacts.value.map((contact) => ({
    label: contact.name,
    value: contact.id,
  }));
  // Keep the current selection visible even before its page is loaded (e.g.
  // editing a lead whose customer isn't on the first page).
  if (
    preselected.value &&
    !contacts.value.some((c) => c.id === preselected.value!.id)
  ) {
    list.unshift({
      label: preselected.value.name,
      value: preselected.value.id,
    });
  }
  return list;
});

const lastItemValue = computed(
  () => items.value[items.value.length - 1]?.value,
);

// Fetch one page; `reset` starts over (new search / first open).
const fetchPage = async (reset = false) => {
  if (loading.value) return;
  if (!reset && !hasMore.value) return;
  loading.value = true;
  try {
    const target = reset ? 1 : page.value;
    const res = await fetchContacts({
      page: target,
      search: searchTerm.value,
    });
    const pagination = Array.isArray(res.pagination) ? null : res.pagination;
    contacts.value = reset ? res.data : [...contacts.value, ...res.data];
    hasMore.value = pagination?.has_more_pages ?? false;
    page.value = target + 1;
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  if (opened.value && hasMore.value && !loading.value) fetchPage();
};

// Lazy: only start loading the list the first time the menu opens.
const onOpen = (open: boolean) => {
  if (!open) return;
  opened.value = true;
  if (!contacts.value.length) fetchPage(true);
};

// Server-side search — debounced so each keystroke doesn't fire a request.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchTerm, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (opened.value) fetchPage(true);
  }, 300);
});

// Resolve the selected contact's name for display when it isn't in the list.
watch(
  model,
  async (id) => {
    if (!id) return;
    if (contacts.value.some((c) => c.id === id)) return;
    if (preselected.value?.id === id) return;
    try {
      preselected.value = await fetchContact(id);
    } catch {
      // Selection still works by id even if the name can't be resolved.
    }
  },
  { immediate: true },
);

// Infinite scroll: observe a sentinel on the last item; load more when it
// scrolls into view.
let observer: IntersectionObserver | null = null;
const setSentinel = (el: Element | null) => {
  if (typeof IntersectionObserver === "undefined") return;
  observer?.disconnect();
  if (!el) return;
  observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) loadMore();
  });
  observer.observe(el);
};

onBeforeUnmount(() => observer?.disconnect());

// Create a contact inline, select it, and surface it at the top of the list.
const onCreate = async (event: FormSubmitEvent<Record<string, unknown>>) => {
  creating.value = true;
  try {
    const contact = await createContact(event.data as ContactInput);
    preselected.value = contact;
    contacts.value = [contact, ...contacts.value];
    model.value = contact.id;
    modalOpen.value = false;
    Object.assign(newContact, createEmptyState(QUICK_CONTACT_FIELDS));
    toast.add({ title: "Contact created", color: "success" });
  } catch {
    toast.add({ title: "Failed to create contact", color: "error" });
  } finally {
    creating.value = false;
  }
};
</script>
