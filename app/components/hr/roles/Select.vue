<template>
  <USelectMenu
    v-model="model"
    v-model:search-term="searchTerm"
    value-key="value"
    ignore-filter
    class="w-full"
    :items="items"
    :loading="loading"
    :placeholder="placeholder ?? 'Select role…'"
    :search-input="{ placeholder: 'Search roles…' }"
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
import type { Role } from "~/types/hr/roles";

const props = defineProps<{
  placeholder?: string;
  // What the model stores: the role `id` (default, e.g. a role's parent_role) or
  // its `name` (e.g. a member's role, which the API resolves by name).
  by?: "id" | "name";
}>();

const model = defineModel<string>();

const by = computed(() => props.by ?? "id");

const { fetchRoles, fetchRole } = useRoles();

const roles = ref<Role[]>([]);
const preselected = ref<Role | null>(null);
const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);
const opened = ref(false);
const searchTerm = ref("");

const valueOf = (role: Role) => (by.value === "name" ? role.name : role.id);

const items = computed(() => {
  const list = roles.value.map((role) => ({
    label: role.name,
    value: valueOf(role),
  }));
  // Keep the current selection visible even before its page is loaded.
  if (model.value && !list.some((r) => r.value === model.value)) {
    if (by.value === "name") {
      // The value is already the role name, so no lookup is needed to label it.
      list.unshift({ label: model.value, value: model.value });
    } else if (preselected.value) {
      list.unshift({
        label: preselected.value.name,
        value: preselected.value.id,
      });
    }
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
    const res = await fetchRoles({
      page: target,
      search: searchTerm.value,
    });
    const pagination = Array.isArray(res.pagination) ? null : res.pagination;
    roles.value = reset ? res.data : [...roles.value, ...res.data];
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
  if (!roles.value.length) fetchPage(true);
};

// Server-side search — debounced so each keystroke doesn't fire a request.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchTerm, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (opened.value) fetchPage(true);
  }, 300);
});

// When storing the id, resolve the selected role's name for display if it isn't
// in the loaded list (e.g. editing a role whose parent isn't on the first page).
watch(
  model,
  async (val) => {
    if (by.value !== "id" || !val) return;
    if (roles.value.some((r) => r.id === val)) return;
    if (preselected.value?.id === val) return;
    try {
      preselected.value = await fetchRole(val);
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
