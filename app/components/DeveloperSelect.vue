<template>
  <USelectMenu
    v-model="model"
    v-model:search-term="searchTerm"
    value-key="value"
    ignore-filter
    class="w-full"
    :items="items"
    :loading="loading"
    :placeholder="placeholder ?? 'Select developer…'"
    :search-input="{ placeholder: 'Search developers…' }"
    @update:open="onOpen"
  >
    <template #item-label="{ item }">
      {{ item.label }}
      <span
        v-if="item.value === lastItemValue"
        class="sr-only"
        :ref="setSentinel"
      />
    </template>
  </USelectMenu>
</template>

<script setup lang="ts">
import type { Developer } from "~/constants/dummy/developers";

defineProps<{
  placeholder?: string;
}>();

// Stores the selected developer's id; the dropdown shows its name.
const model = defineModel<string>();

const { fetchDevelopers, fetchDeveloper } = useDevelopers();

const developers = ref<Developer[]>([]);
const preselected = ref<Developer | null>(null);
const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);
const opened = ref(false);
const searchTerm = ref("");

const items = computed(() => {
  const list = developers.value.map((developer) => ({
    label: developer.name,
    value: developer.id,
  }));
  // Keep the current selection visible even before its page is loaded (e.g.
  // when editing a project whose developer isn't on the first page).
  if (
    preselected.value &&
    !developers.value.some((d) => d.id === preselected.value!.id)
  ) {
    list.unshift({
      label: preselected.value.name,
      value: preselected.value.id,
    });
  }
  return list;
});

const lastItemValue = computed(
  () => items.value[items.value.length - 1]?.value,
);

// Fetch one page; `reset` starts over (new search / first open).
const fetchPage = async (reset = false) => {
  if (loading.value) return;
  if (!reset && !hasMore.value) return;
  loading.value = true;
  try {
    const target = reset ? 1 : page.value;
    const res = await fetchDevelopers({
      page: target,
      search: searchTerm.value,
    });
    const pagination = Array.isArray(res.pagination) ? null : res.pagination;
    developers.value = reset ? res.data : [...developers.value, ...res.data];
    hasMore.value = pagination?.has_more_pages ?? false;
    page.value = target + 1;
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  if (opened.value && hasMore.value && !loading.value) fetchPage();
};

// Lazy: only start loading the list the first time the menu opens.
const onOpen = (open: boolean) => {
  if (!open) return;
  opened.value = true;
  if (!developers.value.length) fetchPage(true);
};

// Server-side search — debounced so each keystroke doesn't fire a request.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchTerm, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (opened.value) fetchPage(true);
  }, 300);
});

// Resolve the selected developer's name for display when it isn't in the list.
watch(
  model,
  async (id) => {
    if (!id) return;
    if (developers.value.some((d) => d.id === id)) return;
    if (preselected.value?.id === id) return;
    try {
      preselected.value = await fetchDeveloper(id);
    } catch {
      // Selection still works by id even if the name can't be resolved.
    }
  },
  { immediate: true },
);

// Infinite scroll: observe a sentinel on the last item; load more when it
// scrolls into view.
let observer: IntersectionObserver | null = null;
const setSentinel = (el: Element | null) => {
  if (typeof IntersectionObserver === "undefined") return;
  observer?.disconnect();
  if (!el) return;
  observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) loadMore();
  });
  observer.observe(el);
};

onBeforeUnmount(() => observer?.disconnect());
</script>
