<template>
  <FormPage
    panel-id="developers-edit"
    back-to="/developers"
    :title="record ? `Edit developer` : `Developer not found`"
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
      submit-label="Save changes"
      :fields="DEVELOPER_FIELDS"
      :state="state"
      :loading="loading"
      @submit="onSubmit"
    />
  </FormPage>
</template>

<script setup lang="ts">
import { DEVELOPER_FIELDS } from "~/constants/forms";
import type { DeveloperInput } from "~/composables/useDevelopers";

const route = useRoute();
const toast = useToast();

const id = route.params.id as string;
const { fetchDeveloper, updateDeveloper } = useDevelopers();

const { data: record } = await useAsyncData(`developer-${id}`, () =>
  fetchDeveloper(id).catch(() => null),
);

const state = reactive<Record<string, unknown>>({ ...(record.value ?? {}) });
const loading = ref(false);

const onSubmit = async (data: Record<string, unknown>) => {
  loading.value = true;
  try {
    await updateDeveloper(id, data as Partial<DeveloperInput>);
    toast.add({ title: "Developer updated", color: "success" });
    navigateTo("/developers");
  } catch {
    toast.add({ title: "Failed to update developer", color: "error" });
  } finally {
    loading.value = false;
  }
};
</script>
