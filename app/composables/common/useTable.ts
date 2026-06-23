import { h, toValue } from "vue";
import type { MaybeRefOrGetter, Ref } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { UButton, USkeleton } from "#components";

export interface SortField {
  key: string;
  label: string;
}

// A select option: either a plain string (label === value) or a { label, value }
// pair when the displayed text differs from the stored value (e.g. a project's
// name shown but its id filtered on).
export type FilterOption = string | { label: string; value: string };

export interface FilterField {
  key: string;
  label: string;
  // "select" (default): multi-select of categorical values.
  // "range": numeric min/max bounds via two inputs.
  // "slider": numeric min/max bounds via a dual-thumb range slider.
  type?: "select" | "range" | "slider";
  // For "select" only — when omitted, distinct row values are used.
  options?: FilterOption[];
  // For "range"/"slider" only — explicit bounds (required for server-side
  // filtering where the current page can't reveal the true min/max).
  min?: number;
  max?: number;
}

type RangeValue = { min: string; max: string };

const SKELETON_COUNT = 6;

const toNum = (x: unknown): number | null => {
  if (x === "" || x == null) return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
};

const toOption = (o: FilterOption) =>
  typeof o === "string" ? { label: o, value: o } : o;

// Shared table state + derived helpers — the engine that used to live inside
// <DataView>. Each feature table owns its own markup and binds to what this
// returns (search/sort/filter state, sortable columns, skeleton placeholders).
export function useTable<T extends { id: string | number }>(opts: {
  // Base columns; augmented with sortable headers + an actions column.
  columns: MaybeRefOrGetter<TableColumn<T>[]>;
  sortFields: SortField[];
  filterFields?: FilterField[];
  // Optional rows ref, only used to derive select-filter options client-side.
  rows?: Ref<T[]>;
  // When set, an "actions" column with an edit link is appended.
  editTo?: (row: T) => string;
  // Initial API sort param, e.g. "-created_at".
  initialSort?: string | null;
}) {
  // Current page for server-side pagination (1-based).
  const page = ref(1);

  // Raw input value; debounced into `search` so server-side parents don't
  // refetch on every keystroke.
  const search = ref("");
  const searchInput = ref("");
  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  watch(searchInput, (value) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      search.value = value.trim();
    }, 300);
  });

  // Sort state, seeded from the initial API sort param and reflected back out
  // as `sortParam` for the feature to refetch with.
  const parseSort = (param: string | null) => ({
    key: param ? param.replace(/^-/, "") : null,
    dir: param?.startsWith("-") ? ("desc" as const) : ("asc" as const),
  });
  const initial = parseSort(opts.initialSort ?? null);
  const sortKey = ref<string | null>(initial.key);
  const sortDir = ref<"asc" | "desc">(initial.dir);
  const sortParam = computed<string | null>(() =>
    sortKey.value
      ? `${sortDir.value === "desc" ? "-" : ""}${sortKey.value}`
      : null,
  );
  const sortableKeys = computed(
    () => new Set(opts.sortFields.map((f) => f.key)),
  );

  const toggleSort = (key: string) => {
    if (sortKey.value === key) {
      sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
    } else {
      sortKey.value = key;
      sortDir.value = "asc";
    }
  };

  const sortIcon = (key: string) => {
    if (sortKey.value !== key) return "i-lucide-chevrons-up-down";
    return sortDir.value === "asc"
      ? "i-lucide-arrow-up"
      : "i-lucide-arrow-down";
  };

  // Value per filter key — string[] for "select", { min, max } for range/slider.
  const filterValues = ref<Record<string, string[] | RangeValue>>({});

  // Seed a blank value for any filter field not yet present (runs reactively so
  // filters that arrive later — e.g. options loaded from the server — get seeded).
  watchEffect(() => {
    for (const f of opts.filterFields ?? []) {
      if (filterValues.value[f.key] === undefined) {
        filterValues.value[f.key] =
          f.type === "range" || f.type === "slider" ? { min: "", max: "" } : [];
      }
    }
  });

  // Resolve each filter for rendering — derive select options or range bounds.
  const resolvedFilters = computed(() =>
    (opts.filterFields ?? []).map((f) => {
      if (f.type === "range" || f.type === "slider") {
        let lo: number;
        let hi: number;
        if (f.min !== undefined && f.max !== undefined) {
          lo = f.min;
          hi = f.max;
        } else {
          const nums = (opts.rows?.value ?? [])
            .map((r) => toNum((r as Record<string, unknown>)[f.key]))
            .filter((n): n is number => n !== null);
          lo = nums.length ? Math.min(...nums) : 0;
          hi = nums.length ? Math.max(...nums) : 0;
        }
        const step = Math.max(1, Math.round((hi - lo) / 100));
        return {
          key: f.key,
          label: f.label,
          type: f.type,
          options: [] as { label: string; value: string }[],
          placeholder: "",
          minPlaceholder: `Min ${lo}`,
          maxPlaceholder: `Max ${hi}`,
          min: lo,
          max: hi,
          step,
        };
      }
      const derived = [
        ...new Set(
          (opts.rows?.value ?? [])
            .map((r) => (r as Record<string, unknown>)[f.key])
            .filter((v) => v != null && v !== "")
            .map(String),
        ),
      ]
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((v) => ({ label: v, value: v }));
      return {
        key: f.key,
        label: f.label,
        type: "select" as const,
        options: f.options ? f.options.map(toOption) : derived,
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
    for (const f of opts.filterFields ?? []) {
      const v = filterValues.value[f.key];
      if (Array.isArray(v)) n += v.length;
      else if (v && (toNum(v.min) !== null || toNum(v.max) !== null)) n += 1;
    }
    return n;
  });

  const filterButtonLabel = computed(() =>
    activeFilterCount.value
      ? `Filters · ${activeFilterCount.value}`
      : "Filters",
  );

  const clearFilters = () => {
    for (const f of opts.filterFields ?? [])
      filterValues.value[f.key] =
        f.type === "range" || f.type === "slider" ? { min: "", max: "" } : [];
  };

  // Add a sortable header button to columns whose accessorKey is a sort field,
  // then append an edit-action column when `editTo` is provided.
  const tableColumns = computed<TableColumn<T>[]>(() => {
    const cols: TableColumn<T>[] = toValue(opts.columns).map((col) => {
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
    }) as TableColumn<T>[];

    if (opts.editTo) {
      cols.push({
        id: "actions",
        header: "",
        cell: ({ row }: { row: { original: T } }) =>
          h(UButton, {
            icon: "i-lucide-pencil",
            color: "neutral",
            variant: "ghost",
            size: "sm",
            to: opts.editTo!(row.original),
            "aria-label": "Edit",
          }),
      } as TableColumn<T>);
    }

    return cols;
  });

  // Placeholder rows + skeleton cells so the header stays visible and skeletons
  // render inside the table body while loading.
  const skeletonRows = computed(() =>
    Array.from({ length: SKELETON_COUNT }, (_, i) => i),
  );

  const skeletonData = computed(
    () => skeletonRows.value.map((i) => ({ id: `skeleton-${i}` })) as T[],
  );

  const skeletonColumns = computed<TableColumn<T>[]>(() =>
    tableColumns.value.map((col) => ({
      ...col,
      cell: () => h(USkeleton, { class: "h-4 w-full" }),
    })),
  );

  return {
    page,
    search,
    searchInput,
    sortParam,
    sortKey,
    sortDir,
    sortFields: opts.sortFields,
    tableColumns,
    skeletonColumns,
    skeletonData,
    skeletonRows,
    filterValues,
    resolvedFilters,
    activeFilterCount,
    filterButtonLabel,
    clearFilters,
    toggleSort,
    sortIcon,
  };
}
