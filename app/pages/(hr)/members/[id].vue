<template>
  <FormPage
    panel-id="members-edit"
    back-to="/members"
    :title="record ? `Edit member` : `Member not found`"
  >
    <div
      v-if="!record"
      class="flex flex-col items-center gap-3 py-16 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-10 text-dimmed" />
      <p class="text-sm text-muted">This member does not exist.</p>
      <UButton label="Back to members" to="/members" />
    </div>

    <HrMembersForm v-else :record="record" />
  </FormPage>
</template>

<script setup lang="ts">
const route = useRoute();

const id = route.params.id as string;
const { fetchMember } = useMembers();

const { data: record } = await useAsyncData(`member-${id}`, () =>
  fetchMember(id).catch(() => null),
);
</script>
