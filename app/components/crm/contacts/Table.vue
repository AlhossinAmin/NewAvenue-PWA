<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <UInput
        v-model="searchInput"
        icon="i-lucide-search"
        class="flex-1"
        placeholder="Search contacts…"
      />

      <!-- Mobile sort sheet -->
      <div class="sm:hidden">
        <UDrawer v-model:open="sortOpen" title="Sort">
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
                  @click="toggleSort(f.key)"
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
    <div class="flex flex-col gap-3 sm:hidden">
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
        <NuxtLink
          v-for="row in contacts"
          class="block"
          :key="row.id"
          :to="`/contacts/${row.id}`"
        >
          <UCard>
            <div class="flex items-center gap-3">
              <UAvatar :text="row.initials" />
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <p class="truncate font-medium">{{ row.name }}</p>
                  <UBadge variant="subtle" size="sm" :color="row.state_color">
                    {{ row.current_state }}
                  </UBadge>
                </div>
                <p class="truncate text-sm text-muted">{{ row.email }}</p>
              </div>
            </div>

            <div
              class="mt-3 flex items-center justify-between text-sm text-muted"
            >
              <a class="flex items-center gap-1.5" :href="row.mobile_tel">
                <UIcon name="i-lucide-phone" class="size-4 shrink-0" />
                {{ row.mobile_label }}
              </a>
              <span class="flex items-center gap-1.5">
                <UIcon name="i-lucide-clock" class="size-4 shrink-0" />
                {{ row.last_activity_date }}
              </span>
            </div>
          </UCard>
        </NuxtLink>
        <p v-if="!contacts.length" class="py-12 text-center text-sm text-muted">
          No results.
        </p>
      </template>
    </div>

    <!-- Desktop: table with sortable headers -->
    <div class="hidden sm:block">
      <UTable
        :data="loading ? skeletonData : contacts"
        :columns="loading ? skeletonColumns : tableColumns"
        :ui="rowUi"
        @select="selectRow"
      >
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar size="sm" :text="row.original.initials" />
            <span class="font-medium">{{ row.original.name }}</span>
          </div>
        </template>

        <template #current_state-cell="{ row }">
          <UBadge variant="subtle" :color="row.original.state_color">
            {{ row.original.current_state }}
          </UBadge>
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
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Contact, ContactState } from "~/types/crm/contacts";

// A contact shaped into display-ready fields the table/cards read directly
// (no function calls in templates).
type ContactRow = Contact & {
  initials: string;
  mobile_label: string;
  mobile_tel: string;
  state_color: "success" | "warning" | "neutral" | "primary";
};

const STATE_COLOR: Record<ContactState, ContactRow["state_color"]> = {
  Active: "success",
  Cold: "warning",
  Inactive: "neutral",
  Converted: "primary",
};

const initials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const columns: TableColumn<ContactRow>[] = [
  { accessorKey: "name", header: "Contact" },
  { accessorKey: "mobile_label", header: "Mobile" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "age", header: "Age" },
  { accessorKey: "current_state", header: "State" },
  { accessorKey: "last_activity_date", header: "Last activity" },
];

const SORT_FIELDS = [
  { key: "name", label: "Name" },
  { key: "age", label: "Age" },
  { key: "current_state", label: "State" },
  { key: "last_activity_date", label: "Last activity" },
  { key: "date_created", label: "Date created" },
];

const editTo = (row: ContactRow) => `/contacts/${row.id}`;

const {
  page,
  search,
  searchInput,
  sortParam,
  sortKey,
  sortDir,
  sortFields,
  sortIcon,
  toggleSort,
  tableColumns,
  skeletonColumns,
  skeletonData,
  skeletonRows,
  selectRow,
  rowUi,
} = useTable<ContactRow>({
  columns,
  sortFields: SORT_FIELDS,
  editTo,
  initialSort: "-created_at",
});

const sortOpen = ref(false);

const { fetchContacts } = useContacts();

const { data, status, refresh } = useAsyncData(
  "contacts",
  () =>
    fetchContacts({
      page: page.value,
      search: search.value,
      sort: sortParam.value,
    }),
  { watch: [page] },
);

// Searching or re-sorting resets to the first page; if already there, refetch
// directly so the change still takes effect.
watch([search, sortParam], () => {
  if (page.value !== 1) page.value = 1;
  else refresh();
});

const loading = computed(() => status.value === "pending");

const contacts = computed<ContactRow[]>(() =>
  (data.value?.data ?? []).map((c) => {
    const primary = c.mobile_nums[0];
    return {
      ...c,
      initials: initials(c.name),
      mobile_label: primary ? `${primary.country_code} ${primary.number}` : "—",
      mobile_tel: primary ? `tel:${primary.country_code}${primary.number}` : "",
      state_color: STATE_COLOR[c.current_state],
    };
  }),
);

const pagination = computed(() =>
  data.value && !Array.isArray(data.value.pagination)
    ? data.value.pagination
    : null,
);
</script>
