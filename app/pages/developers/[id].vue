<script setup lang="ts">
import { DEVELOPER_FIELDS } from "~/constants/forms";
import { DUMMY_DEVELOPERS } from "~/constants/dummy/developers";

const route = useRoute();
const toast = useToast();

const record = DUMMY_DEVELOPERS.find((item) => item.id === route.params.id);
const state = reactive<Record<string, unknown>>({ ...(record ?? {}) });

function onSubmit() {
  // Dummy data is static — surface success and return to the list.
  toast.add({ title: "Developer updated", color: "success" });
  navigateTo("/developers");
}
</script>

<template>
  <FormPage
    panel-id="developers-edit"
    :title="record ? `Edit developer` : `Developer not found`"
    back-to="/developers"
  >
    <div
      v-if="!record"
      class="flex flex-col items-center gap-3 py-16 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-10 text-dimmed" />
      <p class="text-sm text-muted">This developer does not exist.</p>
      <UButton label="Back to developers" to="/developers" />
    </div>
    <ResourceForm
      v-else
      :fields="DEVELOPER_FIELDS"
      :state="state"
      submit-label="Save changes"
      @submit="onSubmit"
    />
  </FormPage>
</template>
