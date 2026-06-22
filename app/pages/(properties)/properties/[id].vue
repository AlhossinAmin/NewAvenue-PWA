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

    <PropertiesPropertiesForm v-else :record="record" />
  </FormPage>
</template>

<script setup lang="ts">
const route = useRoute();

const id = route.params.id as string;
const { fetchProperty } = useProperties();

const { data: record } = await useAsyncData(`property-${id}`, () =>
  fetchProperty(id).catch(() => null),
);
</script>
