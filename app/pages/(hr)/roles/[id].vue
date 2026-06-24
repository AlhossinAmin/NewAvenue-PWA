<template>
  <FormPage panel-id="roles-edit" back-to="/roles" :title="title">
    <template v-if="record && !isEditing" #actions>
      <UButton icon="i-lucide-pencil" label="Edit" @click="isEditing = true" />
    </template>

    <div
      v-if="!record"
      class="flex flex-col items-center gap-3 py-16 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-10 text-dimmed" />
      <p class="text-sm text-muted">This role does not exist.</p>
      <UButton label="Back to roles" to="/roles" />
    </div>

    <HrRolesForm
      v-else-if="isEditing"
      :record="record"
      @saved="onSaved"
      @cancel="isEditing = false"
    />
    <ResourceView v-else :fields="ROLE_FIELDS" :record="record" />
  </FormPage>
</template>

<script setup lang="ts">
import { ROLE_FIELDS } from "~/constants/common/forms";

const route = useRoute();

const id = route.params.id as string;
const { fetchRole } = useRoles();

const { data: record, refresh } = await useAsyncData(`role-${id}`, () =>
  fetchRole(id).catch(() => null),
);

const isEditing = ref(false);

const title = computed(() =>
  record.value
    ? isEditing.value
      ? "Edit role"
      : "Role details"
    : "Role not found",
);

const onSaved = async () => {
  await refresh();
  isEditing.value = false;
};
</script>
