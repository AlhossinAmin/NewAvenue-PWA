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

    <PropertiesDevelopersForm v-else :record="record" />
  </FormPage>
</template>

<script setup lang="ts">
const route = useRoute();

const id = route.params.id as string;
const { fetchDeveloper } = useDevelopers();

const { data: record } = await useAsyncData(`developer-${id}`, () =>
  fetchDeveloper(id).catch(() => null),
);
</script>
