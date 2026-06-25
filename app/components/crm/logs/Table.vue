<template>
  <div class="flex flex-col gap-4">
    <!-- Filters: event, subject type, causer, and a date range -->
    <div class="flex flex-wrap items-center gap-2">
      <USelect
        v-model="eventFilter"
        class="w-full sm:w-44"
        :items="eventOptions"
      />

      <USelect
        v-model="subjectFilter"
        class="w-full sm:w-48"
        :items="subjectOptions"
      />

      <AgentSelect
        v-model="causerFilter"
        class="w-full sm:w-56"
        placeholder="Any causer…"
      />

      <UInput v-model="fromFilter" type="date" class="w-full sm:w-40" />
      <UInput v-model="toFilter" type="date" class="w-full sm:w-40" />

      <UButton
        v-if="hasActiveFilters"
        label="Clear"
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        @click="clearFilters"
      />
    </div>

    <!-- Table at all breakpoints (scrolls horizontally on small screens) -->
    <div class="block overflow-x-auto">
      <UTable
        :data="loading ? skeletonData : logs"
        :columns="loading ? skeletonColumns : tableColumns"
        :ui="{ tr: 'cursor-pointer' }"
        @select="onSelect"
      >
        <template #subject_type-cell="{ row }">
          <div class="flex flex-col">
            <span class="font-medium">{{ row.original.subject_type }}</span>
            <span class="text-xs text-muted">{{
              row.original.subject_id_short
            }}</span>
          </div>
        </template>

        <template #event-cell="{ row }">
          <UBadge variant="subtle" :color="row.original.event_color">
            {{ row.original.event }}
          </UBadge>
        </template>

        <template #changes-cell="{ row }">
          <span class="text-muted">{{ row.original.changes_label }}</span>
        </template>

        <template #causer-cell="{ row }">
          {{ row.original.causer_name }}
        </template>

        <template #created_at-cell="{ row }">
          <span class="whitespace-nowrap text-muted">
            {{ row.original.created_at_label }}
          </span>
        </template>
      </UTable>
    </div>

    <!-- Server-side pagination footer -->
    <div
      v-if="pagination && pagination.total > pagination.per_page"
      class="flex items-center justify-between gap-2"
    >
      <p class="text-sm text-muted">{{ pagination.total }} total</p>
      <UPagination
        v-model:page="page"
        showEdges
        :showControls="false"
        :total="pagination.total"
        :items-per-page="pagination.per_page"
      />
    </div>

    <!-- Changes detail -->
    <UModal v-model:open="detailOpen" title="Log details">
      <template #body>
        <div v-if="selected" class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <UBadge variant="subtle" :color="selected.event_color">
                {{ selected.event }}
              </UBadge>
              <span class="text-sm font-medium">{{
                selected.description
              }}</span>
            </div>
            <p class="text-xs text-muted">
              {{ selected.subject_type }} · {{ selected.subject_id }}
            </p>
            <p class="text-xs text-muted">
              {{ selected.causer_name }}
              <span class="text-dimmed">· {{ selected.created_at_label }}</span>
            </p>
          </div>

          <USeparator />

          <div v-if="selected.change_rows.length" class="flex flex-col gap-3">
            <div
              v-for="change in selected.change_rows"
              class="flex flex-col gap-1 rounded-lg border border-default bg-elevated px-3 py-2"
              :key="change.key"
            >
              <p class="text-xs font-medium text-muted">{{ change.key }}</p>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-error line-through">{{ change.old }}</span>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-4 shrink-0 text-dimmed"
                />
                <span class="text-success">{{ change.new }}</span>
              </div>
            </div>
          </div>

          <p v-else class="text-sm text-muted">No attribute changes recorded.</p>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type {
  ActivityLog,
  ActivityLogEvent,
  ActivityLogChanges,
} from "~/types/crm/activity-logs";

// A single attribute change shaped for the detail modal (read straight by the
// template — no function calls).
type ChangeRow = {
  key: string;
  old: string;
  new: string;
};

// A log shaped into display-ready fields the table/modal read directly (no
// function calls in templates).
type LogRow = ActivityLog & {
  subject_id_short: string;
  event_color: "info" | "neutral" | "warning" | "error" | "success" | "primary";
  causer_name: string;
  created_at_label: string;
  changes_label: string;
  change_rows: ChangeRow[];
};

const EVENT_COLOR: Record<ActivityLogEvent, LogRow["event_color"]> = {
  created: "success",
  updated: "info",
  deleted: "error",
};

// Reka UI's Select rejects an empty-string item value, so "all" is the sentinel
// for "no filter" and is mapped back to a blank query param on fetch.
const eventOptions = [
  { label: "All events", value: "all" },
  { label: "Created", value: "created" },
  { label: "Updated", value: "updated" },
  { label: "Deleted", value: "deleted" },
];

const columns: TableColumn<LogRow>[] = [
  { accessorKey: "subject_type", header: "Subject" },
  { accessorKey: "event", header: "Event" },
  { accessorKey: "description", header: "Description" },
  { accessorKey: "changes", header: "Changes" },
  { accessorKey: "causer", header: "Causer" },
  { accessorKey: "created_at", header: "Date" },
];

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

// Render any captured value as a readable cell; objects are JSON-encoded and
// blanks fall back to an em dash.
const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const { fetchActivityLogs } = useActivityLogs();

const { page, tableColumns, skeletonColumns, skeletonData } = useTable<LogRow>({
  columns,
  sortFields: [],
});

// Filter state — each maps to a query param the API understands. The two selects
// default to the "all" sentinel (mapped to a blank param on fetch).
const eventFilter = ref("all");
const subjectFilter = ref("all");
const causerFilter = ref("");
const fromFilter = ref("");
const toFilter = ref("");

const hasActiveFilters = computed(
  () =>
    eventFilter.value !== "all" ||
    subjectFilter.value !== "all" ||
    Boolean(causerFilter.value) ||
    Boolean(fromFilter.value) ||
    Boolean(toFilter.value),
);

const clearFilters = () => {
  eventFilter.value = "all";
  subjectFilter.value = "all";
  causerFilter.value = "";
  fromFilter.value = "";
  toFilter.value = "";
};

const { data, status, refresh } = useAsyncData(
  "activity-logs",
  () =>
    fetchActivityLogs({
      page: page.value,
      event: eventFilter.value === "all" ? "" : eventFilter.value,
      subject_type: subjectFilter.value === "all" ? "" : subjectFilter.value,
      causer_id: causerFilter.value,
      from: fromFilter.value,
      to: toFilter.value,
    }),
  { watch: [page] },
);

// Changing any filter resets to the first page; if already there, refetch
// directly so the change still takes effect.
watch(
  [eventFilter, subjectFilter, causerFilter, fromFilter, toFilter],
  () => {
    if (page.value !== 1) page.value = 1;
    else refresh();
  },
);

const loading = computed(() => status.value === "pending");

// Distinct subject types accumulate across pages so the filter dropdown reflects
// the entities actually present in the feed (there is no facets endpoint).
const seenSubjects = ref<string[]>([]);

const subjectOptions = computed(() => [
  { label: "All subjects", value: "all" },
  ...seenSubjects.value.map((s) => ({ label: s, value: s })),
]);

// Build the before/after rows for an entry: the union of changed keys with each
// side's value (missing sides render as an em dash).
const buildChangeRows = (changes: ActivityLog["changes"]): ChangeRow[] => {
  if (Array.isArray(changes)) return [];
  const { attributes = {}, old = {} } = changes as ActivityLogChanges;
  const keys = [...new Set([...Object.keys(attributes), ...Object.keys(old)])];
  return keys.map((key) => ({
    key,
    old: formatValue(old[key]),
    new: formatValue(attributes[key]),
  }));
};

const logs = computed<LogRow[]>(() =>
  (data.value?.data ?? []).map((log) => {
    const change_rows = buildChangeRows(log.changes);
    return {
      ...log,
      subject_id_short: log.subject_id ? `${log.subject_id.slice(0, 8)}…` : "—",
      event_color: EVENT_COLOR[log.event] ?? "neutral",
      causer_name: log.causer?.name ?? "System",
      created_at_label: dateFormatter.format(new Date(log.created_at)),
      changes_label: change_rows.length
        ? `${change_rows.length} field${change_rows.length === 1 ? "" : "s"}`
        : "—",
      change_rows,
    };
  }),
);

// Keep the subject-type filter options in sync with whatever the feed surfaces.
watch(logs, (rows) => {
  const next = new Set(seenSubjects.value);
  for (const row of rows) if (row.subject_type) next.add(row.subject_type);
  seenSubjects.value = [...next].sort((a, b) => a.localeCompare(b));
});

const pagination = computed(() =>
  data.value && !Array.isArray(data.value.pagination)
    ? data.value.pagination
    : null,
);

const detailOpen = ref(false);
const selected = ref<LogRow | null>(null);

const onSelect = (_event: Event, row: { original: LogRow }) => {
  // Skeleton placeholder rows carry synthetic string ids — ignore clicks while
  // loading.
  if (typeof row.original.id === "string") return;
  selected.value = row.original;
  detailOpen.value = true;
};
</script>
