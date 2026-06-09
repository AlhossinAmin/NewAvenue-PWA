<script setup lang="ts" generic="T extends { id: string | number }">
import { h, resolveComponent, useSlots } from "vue";
import type { TableColumn } from "@nuxt/ui";

interface SortField {
  key: string;
  label: string;
}

const props = defineProps<{
  rows: T[];
  columns: TableColumn<T>[];
  sortFields: SortField[];
  searchPlaceholder?: string;
  editTo?: (row: T) => string;
  // When true, render the table at every breakpoint (with horizontal scroll on
  // small screens) instead of the mobile card list.
  mobileTable?: boolean;
}>();

const UButton = resolveComponent("UButton");
const slots = useSlots();

const search = ref("");
const sortKey = ref<string | null>(null);
const sortDir = ref<"asc" | "desc">("asc");
const sheetOpen = ref(false);

const sortableKeys = computed(
  () => new Set(props.sortFields.map((f) => f.key)),
);

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
}

function selectSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
}

function sortIcon(key: string) {
  if (sortKey.value !== key) return "i-lucide-chevrons-up-down";
  return sortDir.value === "asc" ? "i-lucide-arrow-up" : "i-lucide-arrow-down";
}

// Add a sortable header button to columns whose accessorKey is a sort field.
const tableColumns = computed<TableColumn<T>[]>(() => {
  const cols: TableColumn<T>[] = props.columns.map((col) => {
    const key = (col as { accessorKey?: string }).accessorKey;
    const label = typeof col.header === "string" ? col.header : "";
    if (key && sortableKeys.value.has(key)) {
      return {
        ...col,
        header: () =>
          h(UButton, {
            color: "neutral",
            variant: "ghost",
            size: "sm",
            label,
            trailingIcon: sortIcon(key),
            class: "-mx-2.5 data-[state=open]:bg-elevated",
            onClick: () => toggleSort(key),
          }),
      };
    }
    return col;
  });

  if (props.editTo) {
    cols.push({
      id: "actions",
      header: "",
      cell: ({ row }: { row: { original: T } }) =>
        h(UButton, {
          icon: "i-lucide-pencil",
          color: "neutral",
          variant: "ghost",
          size: "sm",
          to: props.editTo!(row.original),
          "aria-label": "Edit",
        }),
    } as TableColumn<T>);
  }

  return cols;
});

function matches(row: T) {
  const q = search.value.trim().toLowerCase();
  if (!q) return true;
  return Object.values(row as Record<string, unknown>).some(
    (v) =>
      (typeof v === "string" || typeof v === "number") &&
      String(v).toLowerCase().includes(q),
  );
}

const displayRows = computed(() => {
  const result = props.rows.filter(matches);
  const key = sortKey.value;
  if (!key) return result;
  const dir = sortDir.value;
  return [...result].sort((a, b) => {
    const av = (a as Record<string, unknown>)[key];
    const bv = (b as Record<string, unknown>)[key];
    let r: number;
    if (typeof av === "number" && typeof bv === "number") r = av - bv;
    else if (typeof av === "boolean" && typeof bv === "boolean")
      r = av === bv ? 0 : av ? 1 : -1;
    else
      r = String(av ?? "").localeCompare(String(bv ?? ""), undefined, {
        numeric: true,
      });
    return dir === "asc" ? r : -r;
  });
});

// Forward every slot except #card (the mobile card renderer) to the table.
const forwardedSlots = computed(() =>
  Object.keys(slots).filter((name) => name !== "card"),
);
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        :placeholder="searchPlaceholder ?? 'Search…'"
        class="flex-1"
      />

      <!-- Mobile sort sheet -->
      <div class="sm:hidden">
        <UDrawer v-model:open="sheetOpen" title="Sort">
          <UButton
            icon="i-lucide-arrow-up-down"
            color="neutral"
            variant="outline"
            square
            aria-label="Sort"
          />

          <template #body>
            <div class="flex flex-col gap-4 pb-4">
              <div class="flex gap-2">
                <UButton
                  label="Ascending"
                  icon="i-lucide-arrow-up"
                  block
                  :color="sortDir === 'asc' ? 'primary' : 'neutral'"
                  :variant="sortDir === 'asc' ? 'solid' : 'outline'"
                  @click="sortDir = 'asc'"
                />
                <UButton
                  label="Descending"
                  icon="i-lucide-arrow-down"
                  block
                  :color="sortDir === 'desc' ? 'primary' : 'neutral'"
                  :variant="sortDir === 'desc' ? 'solid' : 'outline'"
                  @click="sortDir = 'desc'"
                />
              </div>

              <div class="flex flex-col gap-1">
                <p class="px-1 text-xs font-medium text-muted">Sort by</p>
                <UButton
                  v-for="f in sortFields"
                  :key="f.key"
                  :label="f.label"
                  block
                  class="justify-between"
                  :color="sortKey === f.key ? 'primary' : 'neutral'"
                  :variant="sortKey === f.key ? 'soft' : 'ghost'"
                  :trailing-icon="
                    sortKey === f.key ? sortIcon(f.key) : undefined
                  "
                  @click="selectSort(f.key)"
                />
                <UButton
                  v-if="sortKey"
                  label="Clear sort"
                  color="neutral"
                  variant="link"
                  block
                  @click="sortKey = null"
                />
              </div>
            </div>
          </template>
        </UDrawer>
      </div>
    </div>

    <!-- Mobile: card list -->
    <div v-if="!mobileTable" class="flex flex-col gap-3 sm:hidden">
      <template v-for="row in displayRows" :key="row.id">
        <NuxtLink v-if="editTo" :to="editTo(row)" class="block">
          <slot name="card" :row="row" />
        </NuxtLink>
        <slot v-else name="card" :row="row" />
      </template>
      <p
        v-if="!displayRows.length"
        class="py-12 text-center text-sm text-muted"
      >
        No results.
      </p>
    </div>

    <!-- Table with sortable headers (always shown on desktop; on mobile too when
         mobileTable is set, scrolling horizontally) -->
    <div :class="mobileTable ? 'block overflow-x-auto' : 'hidden sm:block'">
      <UTable :data="displayRows" :columns="tableColumns">
        <template v-for="name in forwardedSlots" :key="name" #[name]="slotData">
          <slot :name="name" v-bind="slotData" />
        </template>
      </UTable>
    </div>
  </div>
</template>
