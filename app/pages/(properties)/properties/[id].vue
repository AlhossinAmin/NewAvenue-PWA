<template>
  <FormPage
    panel-id="properties-edit"
    back-to="/properties"
    :title="record ? `Edit property` : `Property not found`"
  >
    <div
      v-if="!record"
      class="flex flex-col items-center gap-3 py-16 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-10 text-dimmed" />
      <p class="text-sm text-muted">This property does not exist.</p>
      <UButton label="Back to properties" to="/properties" />
    </div>
    <ResourceForm
      v-else
      submit-label="Save changes"
      :fields="PROPERTY_FIELDS"
      :state="state"
      :loading="loading"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { PROPERTY_FIELDS } from "~/constants/common/forms";
import type { PropertyInput } from "~/composables/properties/useProperties";

const route = useRoute();
const toast = useToast();

const id = route.params.id as string;
const { fetchProperty, updateProperty } = useProperties();

const { data: record } = await useAsyncData(`property-${id}`, () =>
  fetchProperty(id).catch(() => null),
);

// The API returns `project`/`developer` as { id, name } objects, but the form
// (and the update payload) work with their UUIDs — seed them from `*.id`.
const state = reactive<Record<string, unknown>>({
  ...(record.value ?? {}),
  project: record.value?.project?.id ?? "",
  developer: record.value?.developer?.id ?? "",
});
const loading = ref(false);

const onSubmit = async (data: Record<string, unknown>) => {
  loading.value = true;
  try {
    await updateProperty(id, data as Partial<PropertyInput>);
    toast.add({ title: "Property updated", color: "success" });
    navigateTo("/properties");
  } catch {
    toast.add({ title: "Failed to update property", color: "error" });
  } finally {
    loading.value = false;
  }
};
</script>
