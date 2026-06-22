<template>
  <FormPage
    panel-id="roles-edit"
    back-to="/roles"
    :title="record ? `Edit role` : `Role not found`"
  >
    <div
      v-if="!record"
      class="flex flex-col items-center gap-3 py-16 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-10 text-dimmed" />
      <p class="text-sm text-muted">This role does not exist.</p>
      <UButton label="Back to roles" to="/roles" />
    </div>

    <HrRolesForm v-else :record="record" />
  </FormPage>
</template>

<script setup lang="ts">
const route = useRoute();

const id = route.params.id as string;
const { fetchRole } = useRoles();

const { data: record } = await useAsyncData(`role-${id}`, () =>
  fetchRole(id).catch(() => null),
);
</script>
