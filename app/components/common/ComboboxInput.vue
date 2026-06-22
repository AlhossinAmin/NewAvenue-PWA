<template>
  <USelectMenu
    v-model="model"
    :items="items"
    create-item
    :placeholder="placeholder ?? 'Select…'"
    class="w-full"
    @create="onCreate"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  options?: string[];
  placeholder?: string;
}>();

const model = defineModel<string>();

// Values the user added inline this session, kept so they stay selectable.
const created = ref<string[]>([]);

// Fixed options + any created ones, plus the current value if it isn't in the
// list (e.g. editing a record whose district was a custom entry).
const items = computed(() => {
  const list = [...(props.options ?? []), ...created.value];
  const current = model.value;
  if (current && !list.includes(current)) list.push(current);
  return list;
});

const onCreate = (item: string) => {
  if (!created.value.includes(item)) created.value.push(item);
  model.value = item;
};
</script>
