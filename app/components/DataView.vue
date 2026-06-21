<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <UInput
        v-model="searchInput"
        icon="i-lucide-search"
        class="flex-1"
        :placeholder="searchPlaceholder ?? 'Search…'"
      />

      <!-- Filters: popover on desktop, bottom drawer on mobile -->
      <template v-if="filterFields?.length">
        <div class="hidden sm:block">
          <UPopover :content="{ align: 'end' }">
            <UButton
              icon="i-lucide-list-filter"
              :label="filterButtonLabel"
              :color="activeFilterCount ? 'primary' : 'neutral'"
              :variant="activeFilterCount ? 'soft' : 'outline'"
            />
            <template #content>
              <div class="w-72 p-4">
                <DataViewFilters
                  :filters="resolvedFilters"
                  :values="filterValues"
                  :active-count="activeFilterCount"
                  @clear="clearFilters"
                />
              </div>
            </template>
          </UPopover>
        </div>

        <div class="sm:hidden">
          <UDrawer v-model:open="filterOpen" title="Filters">
            <UButton
              icon="i-lucide-list-filter"
              :label="filterButtonLabel"
              :color="activeFilterCount ? 'primary' : 'neutral'"
              :variant="activeFilterCount ? 'soft' : 'outline'"
            />
            <template #body>
              <DataViewFilters
                :filters="resolvedFilters"
                :values="filterValues"
                :active-count="activeFilterCount"
                @clear="clearFilters"
              />
            </template>
          </UDrawer>
        </div>
      </template>

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
                  block
                  class="justify-between"
                  :key="f.key"
                  :label="f.label"
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
      <template v-if="loading">
        <div
          v-for="n in skeletonRows"
          class="rounded-lg border border-default p-4"
          :key="n"
        >
          <div class="flex items-center gap-3">
            <USkeleton class="size-10 shrink-0 rounded-full" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-1/2" />
              <USkeleton class="h-3 w-3/4" />
            </div>
          </div>
          <USkeleton class="mt-3 h-3 w-full" />
        </div>
      </template>
      <template v-else>
        <template v-for="row in displayRows" :key="row.id">
          <NuxtLink v-if="editTo" class="block" :to="editTo(row)">
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
      </template>
    </div>

    <!-- Table with sortable headers (always shown on desktop; on mobile too when
         mobileTable is set, scrolling horizontally) -->
    <div :class="mobileTable ? 'block overflow-x-auto' : 'hidden sm:block'">
      <UTable
        :data="loading ? skeletonData : displayRows"
        :columns="loading ? skeletonColumns : tableColumns"
      >
        <template v-for="name in forwardedSlots" #[name]="slotData" :key="name">
          <USkeleton
            v-if="loading && name.endsWith('-cell')"
            class="h-4 w-full"
          />
          <slot v-else :name="name" v-bind="slotData" />
        </template>
      </UTable>
    </div>

    <!-- Server-side pagination footer -->
    <div
      v-if="total && perPage && total > perPage"
      class="flex items-center justify-between gap-2"
    >
      <p class="text-sm text-muted">{{ total }} results</p>
      <UPagination
        v-model:page="page"
        :total="total"
        :items-per-page="perPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends { id: string | number }">
import { h, resolveComponent, useSlots } from "vue";
import type { TableColumn } from "@nuxt/ui";

interface SortField {
  key: string;
  label: string;
}

interface FilterField {
  key: string;
  label: string;
  // "select" (default): multi-select of categorical values.
  // "range": numeric min/max bounds via two inputs.
  // "slider": numeric min/max bounds via a dual-thumb range slider.
  type?: "select" | "range" | "slider";
  // For "select" only — when omitted, distinct row values are used.
  options?: string[];
}

type RangeValue = { min: string; max: string };

const toNum = (x: unknown): number | null => {
  if (x === "" || x == null) return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
};

const props = defineProps<{
  rows: T[];
  columns: TableColumn<T>[];
  sortFields: SortField[];
  searchPlaceholder?: string;
  editTo?: (row: T) => string;
  // When true, render the table at every breakpoint (with horizontal scroll on
  // small screens) instead of the mobile card list.
  mobileTable?: boolean;
  // Multi-select filters. Each maps to a row property; selecting values keeps
  // only rows whose value is among the selection.
  filterFields?: FilterField[];
  // Server-side pagination. When `total` is provided, `rows` is treated as the
  // current page (no client slicing) and a pagination footer is rendered.
  // Drive the current page with `v-model:page`.
  total?: number;
  perPage?: number;
  // When true, search/sort/filtering happen on the server: `rows` is rendered
  // as-is and the search box + sort headers only emit `v-model:search` /
  // `v-model:sort` for the parent to refetch with.
  serverSide?: boolean;
  // When true, render skeleton placeholders instead of rows while data loads.
  loading?: boolean;
}>();

// Number of skeleton placeholders to render while loading.
const SKELETON_COUNT = 6;
const skeletonRows = computed(() =>
  Array.from({ length: SKELETON_COUNT }, (_, i) => i),
);

// Current page for server-side pagination (1-based). Two-way bound so the
// parent can refetch when it changes.
const page = defineModel<number>("page", { default: 1 });

// Search query (debounced) and sort param (API format, e.g. "-created_at").
// Two-way bound so a server-side parent can refetch when they change.
const searchQuery = defineModel<string>("search", { default: "" });
const sortParam = defineModel<string | null>("sort", { default: null });

const UButton = resolveComponent("UButton");
const USkeleton = resolveComponent("USkeleton");
const slots = useSlots();

// Raw input value; debounced into `searchQuery` so server-side parents don't
// refetch on every keystroke.
const searchInput = ref(searchQuery.value);
let searchTimer: ReturnType<typeof setTimeout> | undefined;

watch(searchInput, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery.value = value.trim();
  }, 300);
});

// Seed internal sort state from an incoming `sort` param (e.g. "-created_at").
const parseSort = (param: string | null) => ({
  key: param ? param.replace(/^-/, "") : null,
  dir: param?.startsWith("-") ? ("desc" as const) : ("asc" as const),
});

const initialSort = parseSort(sortParam.value);
const sortKey = ref<string | null>(initialSort.key);
const sortDir = ref<"asc" | "desc">(initialSort.dir);

// Reflect internal sort changes back out as an API sort param.
watch([sortKey, sortDir], () => {
  sortParam.value = sortKey.value
    ? `${sortDir.value === "desc" ? "-" : ""}${sortKey.value}`
    : null;
});

const sheetOpen = ref(false);
const filterOpen = ref(false);

// Value per filter key — string[] for "select", { min, max } for "range".
// e.g. { status: ["Available"], area: { min: "100", max: "" } }.
const filterValues = ref<Record<string, string[] | RangeValue>>(
  Object.fromEntries(
    (props.filterFields ?? []).map((f) => [
      f.key,
      f.type === "range" || f.type === "slider" ? { min: "", max: "" } : [],
    ]),
  ),
);

// Resolve each filter for rendering — derive select options or range bounds.
const resolvedFilters = computed(() =>
  (props.filterFields ?? []).map((f) => {
    if (f.type === "range" || f.type === "slider") {
      const nums = props.rows
        .map((r) => toNum((r as Record<string, unknown>)[f.key]))
        .filter((n): n is number => n !== null);
      const lo = nums.length ? Math.min(...nums) : 0;
      const hi = nums.length ? Math.max(...nums) : 0;
      const step = Math.max(1, Math.round((hi - lo) / 100));
      return {
        key: f.key,
        label: f.label,
        type: f.type,
        options: [] as string[],
        placeholder: "",
        minPlaceholder: `Min ${lo}`,
        maxPlaceholder: `Max ${hi}`,
        min: lo,
        max: hi,
        step,
      };
    }
    const values = props.rows
      .map((r) => (r as Record<string, unknown>)[f.key])
      .filter((v) => v != null && v !== "")
      .map(String);
    return {
      key: f.key,
      label: f.label,
      type: "select" as const,
      options:
        f.options ??
        [...new Set(values)].sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true }),
        ),
      placeholder: `Any ${f.label.toLowerCase()}`,
      minPlaceholder: "",
      maxPlaceholder: "",
      min: 0,
      max: 0,
      step: 1,
    };
  }),
);

const activeFilterCount = computed(() => {
  let n = 0;
  for (const f of props.filterFields ?? []) {
    const v = filterValues.value[f.key];
    if (Array.isArray(v)) n += v.length;
    else if (v && (toNum(v.min) !== null || toNum(v.max) !== null)) n += 1;
  }
  return n;
});

const filterButtonLabel = computed(() =>
  activeFilterCount.value ? `Filters · ${activeFilterCount.value}` : "Filters",
);

const clearFilters = () => {
  for (const f of props.filterFields ?? [])
    filterValues.value[f.key] =
      f.type === "range" || f.type === "slider" ? { min: "", max: "" } : [];
};

const passesFilters = (row: T) => {
  return (props.filterFields ?? []).every((f) => {
    const v = filterValues.value[f.key];
    if (!v) return true;
    const cell = (row as Record<string, unknown>)[f.key];
    if (Array.isArray(v)) {
      return !v.length || v.includes(String(cell));
    }
    const num = toNum(cell);
    const lo = toNum(v.min);
    const hi = toNum(v.max);
    if (lo !== null && (num === null || num < lo)) return false;
    if (hi !== null && (num === null || num > hi)) return false;
    return true;
  });
};

const sortableKeys = computed(
  () => new Set(props.sortFields.map((f) => f.key)),
);

const toggleSort = (key: string) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
};

const selectSort = (key: string) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
};

const sortIcon = (key: string) => {
  if (sortKey.value !== key) return "i-lucide-chevrons-up-down";
  return sortDir.value === "asc" ? "i-lucide-arrow-up" : "i-lucide-arrow-down";
};

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

// While loading, feed the table placeholder rows and skeleton cells so the
// header stays visible and the skeletons render inside the table body.
const skeletonData = computed(
  () => skeletonRows.value.map((i) => ({ id: `skeleton-${i}` })) as T[],
);

const skeletonColumns = computed<TableColumn<T>[]>(() =>
  tableColumns.value.map((col) => ({
    ...col,
    cell: () => h(USkeleton, { class: "h-4 w-full" }),
  })),
);

const matches = (row: T) => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return true;
  return Object.values(row as Record<string, unknown>).some(
    (v) =>
      (typeof v === "string" || typeof v === "number") &&
      String(v).toLowerCase().includes(q),
  );
};

const displayRows = computed(() => {
  // Server-side mode: rows are already searched/sorted/paged by the API.
  if (props.serverSide) return props.rows;
  const result = props.rows.filter((r) => matches(r) && passesFilters(r));
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
