<script setup lang="ts">
import { PROPERTY_FIELDS } from "~/constants/forms";
import { DUMMY_PROPERTIES } from "~/constants/dummy/properties";

const route = useRoute();
const toast = useToast();

const record = DUMMY_PROPERTIES.find((item) => item.id === route.params.id);
const state = reactive<Record<string, unknown>>({ ...(record ?? {}) });

function onSubmit() {
  // Dummy data is static — surface success and return to the list.
  toast.add({ title: "Property updated", color: "success" });
  navigateTo("/properties");
}
</script>

<template>
  <FormPage
    panel-id="properties-edit"
    :title="record ? `Edit property` : `Property not found`"
    back-to="/properties"
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
      :fields="PROPERTY_FIELDS"
      :state="state"
      submit-label="Save changes"
      @submit="onSubmit"
    />
  </FormPage>
</template>
