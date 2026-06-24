<template>
  <FormPage panel-id="developers-edit" back-to="/developers" :title="title">
    <template v-if="record && !isEditing" #actions>
      <UButton icon="i-lucide-pencil" label="Edit" @click="isEditing = true" />
    </template>

    <div
      v-if="!record"
      class="flex flex-col items-center gap-3 py-16 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-10 text-dimmed" />
      <p class="text-sm text-muted">This developer does not exist.</p>
      <UButton label="Back to developers" to="/developers" />
    </div>

    <PropertiesDevelopersForm
      v-else-if="isEditing"
      :record="record"
      @saved="onSaved"
      @cancel="isEditing = false"
    />
    <ResourceView v-else :fields="DEVELOPER_VIEW_FIELDS" :record="record" />
  </FormPage>
</template>

<script setup lang="ts">
import type { FormField } from "~/constants/common/forms";

const route = useRoute();

const id = route.params.id as string;
const { fetchDeveloper } = useDevelopers();

const { data: record, refresh } = await useAsyncData(`developer-${id}`, () =>
  fetchDeveloper(id).catch(() => null),
);

const isEditing = ref(false);

// Read-only display spec for the detail view. Mirrors developers/Form.vue.
const DEVELOPER_VIEW_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "country", label: "Country", type: "text" },
  { key: "agreement", label: "Agreement", type: "select" },
  { key: "agreement_end_date", label: "Agreement end date", type: "date" },
  { key: "projects_count", label: "Projects count", type: "number" },
  { key: "num_deals", label: "Number of deals", type: "number" },
  {
    key: "default_commission",
    label: "Default commission (%)",
    type: "number",
  },
  { key: "commission_min", label: "Commission min (%)", type: "number" },
  { key: "commission_max", label: "Commission max (%)", type: "number" },
  { key: "logo", label: "Logo", type: "photo" },
  { key: "description", label: "Description", type: "textarea", full: true },
];

const title = computed(() =>
  record.value
    ? isEditing.value
      ? "Edit developer"
      : "Developer details"
    : "Developer not found",
);

const onSaved = async () => {
  await refresh();
  isEditing.value = false;
};
</script>
