<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <UInput
        v-model="searchInput"
        icon="i-lucide-search"
        class="flex-1"
        placeholder="Search developers…"
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
          v-for="row in developers"
          class="block"
          :key="row.id"
          :to="`/developers/${row.id}`"
        >
          <UCard>
            <div class="flex items-start gap-3">
              <UAvatar :src="row.logo" :alt="row.name" :text="row.initials" />
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <p class="truncate font-semibold">{{ row.name }}</p>
                  <UBadge
                    variant="subtle"
                    size="sm"
                    :color="row.agreement_color"
                  >
                    {{ row.agreement }}
                  </UBadge>
                </div>
                <p class="mt-1 line-clamp-2 text-sm text-muted">
                  {{ row.description }}
                </p>
              </div>
            </div>

            <div class="mt-3 flex items-center justify-between text-sm">
              <div class="flex items-center gap-3 text-muted">
                <span class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-layout-grid" class="size-4 shrink-0" />
                  {{ row.projects_count }} projects
                </span>
                <span class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-handshake" class="size-4 shrink-0" />
                  {{ row.num_deals }} deals
                </span>
              </div>
              <span class="font-medium">{{ row.commission_label }} comm.</span>
            </div>
          </UCard>
        </NuxtLink>
        <p
          v-if="!developers.length"
          class="py-12 text-center text-sm text-muted"
        >
          No results.
        </p>
      </template>
    </div>

    <!-- Desktop: table with sortable headers -->
    <div class="hidden sm:block">
      <UTable
        :data="loading ? skeletonData : developers"
        :columns="loading ? skeletonColumns : tableColumns"
      >
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar
              size="sm"
              :src="row.original.logo"
              :alt="row.original.name"
              :text="row.original.initials"
            />
            <span class="font-medium">{{ row.original.name }}</span>
          </div>
        </template>

        <template #default_commission-cell="{ row }">
          {{ row.original.commission_label }}
        </template>

        <template #agreement-cell="{ row }">
          <UBadge variant="subtle" :color="row.original.agreement_color">
            {{ row.original.agreement }}
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
import type { Developer, AgreementStatus } from "~/types/properties/developers";

// A developer shaped into display-ready fields the table/cards read directly
// (no function calls in templates).
type DeveloperRow = Developer & {
  initials: string;
  commission_label: string;
  agreement_color: "success" | "warning" | "error";
};

const AGREEMENT_COLOR: Record<
  AgreementStatus,
  DeveloperRow["agreement_color"]
> = {
  Signed: "success",
  Pending: "warning",
  Expired: "error",
};

const initials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const commissionLabel = (d: Developer): string =>
  d.commission_min === d.commission_max
    ? `${d.default_commission}%`
    : `${d.commission_min}–${d.commission_max}%`;

const columns: TableColumn<DeveloperRow>[] = [
  { accessorKey: "name", header: "Developer" },
  { accessorKey: "country", header: "Country" },
  { accessorKey: "projects_count", header: "Projects" },
  { accessorKey: "num_deals", header: "Deals" },
  { accessorKey: "default_commission", header: "Commission" },
  { accessorKey: "agreement", header: "Agreement" },
  { accessorKey: "agreement_end_date", header: "Agreement end date" },
];

const SORT_FIELDS = [
  { key: "name", label: "Name" },
  { key: "country", label: "Country" },
  { key: "projects_count", label: "Projects" },
  { key: "num_deals", label: "Deals" },
  { key: "default_commission", label: "Commission" },
  { key: "agreement", label: "Agreement" },
  { key: "agreement_end_date", label: "Agreement end date" },
];

const editTo = (row: DeveloperRow) => `/developers/${row.id}`;

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
} = useTable<DeveloperRow>({
  columns,
  sortFields: SORT_FIELDS,
  editTo,
  initialSort: "-created_at",
});

const sortOpen = ref(false);

const { fetchDevelopers } = useDevelopers();

const { data, status, refresh } = useAsyncData(
  "developers",
  () =>
    fetchDevelopers({
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

const developers = computed<DeveloperRow[]>(() =>
  (data.value?.data ?? []).map((d) => ({
    ...d,
    initials: initials(d.name),
    commission_label: commissionLabel(d),
    agreement_color: AGREEMENT_COLOR[d.agreement],
  })),
);

const pagination = computed(() =>
  data.value && !Array.isArray(data.value.pagination)
    ? data.value.pagination
    : null,
);
</script>
