<template>
  <ResourcePage
    panel-id="developers"
    title="Developers"
    icon="i-lucide-building-2"
    new-label="New developer"
    create-to="/developers/new"
  >
    <DataView
      v-model:page="page"
      v-model:search="search"
      v-model:sort="sort"
      server-side
      search-placeholder="Search developers…"
      :rows="developers"
      :columns="columns"
      :sort-fields="sortFields"
      :total="pagination?.total"
      :per-page="pagination?.per_page"
      :loading="status === 'pending'"
      :edit-to="(row) => `/developers/${row.id}`"
    >
      <template #card="{ row }">
        <UCard>
          <div class="flex items-start gap-3">
            <UAvatar :src="row.logo" :alt="row.name" :text="row.initials" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <p class="truncate font-semibold">{{ row.name }}</p>
                <UBadge
                  variant="subtle"
                  size="sm"
                  :color="agreementColor(row.agreement)"
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
      </template>

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
        <UBadge
          variant="subtle"
          :color="agreementColor(row.original.agreement)"
        >
          {{ row.original.agreement }}
        </UBadge>
      </template>
    </DataView>
  </ResourcePage>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Developer, AgreementStatus } from "~/types/properties/developers";

type DeveloperRow = Developer & { initials: string; commission_label: string };

const { fetchDevelopers } = useDevelopers();

const page = ref(1);
const search = ref("");
const sort = ref<string | null>("-created_at");

const { data, status, refresh } = useAsyncData(
  "developers",
  () =>
    fetchDevelopers({
      page: page.value,
      search: search.value,
      sort: sort.value,
    }),
  { watch: [page] },
);

// Searching or re-sorting resets to the first page; if already there, refetch
// directly so the change still takes effect.
watch([search, sort], () => {
  if (page.value !== 1) page.value = 1;
  else refresh();
});

const developers = computed<DeveloperRow[]>(() =>
  (data.value?.data ?? []).map((d) => ({
    ...d,
    initials: initials(d.name),
    commission_label: commissionLabel(d),
  })),
);

const pagination = computed(() =>
  data.value && !Array.isArray(data.value.pagination)
    ? data.value.pagination
    : null,
);

const AGREEMENT_COLOR: Record<
  AgreementStatus,
  "success" | "warning" | "error"
> = {
  Signed: "success",
  Pending: "warning",
  Expired: "error",
};

const agreementColor = (agreement: AgreementStatus) => {
  return AGREEMENT_COLOR[agreement];
};

const columns: TableColumn<DeveloperRow>[] = [
  { accessorKey: "name", header: "Developer" },
  { accessorKey: "country", header: "Country" },
  { accessorKey: "projects_count", header: "Projects" },
  { accessorKey: "num_deals", header: "Deals" },
  { accessorKey: "default_commission", header: "Commission" },
  { accessorKey: "agreement", header: "Agreement" },
  { accessorKey: "agreement_end_date", header: "Agreement end date" },
];

const sortFields = [
  { key: "name", label: "Name" },
  { key: "country", label: "Country" },
  { key: "projects_count", label: "Projects" },
  { key: "num_deals", label: "Deals" },
  { key: "default_commission", label: "Commission" },
  { key: "agreement", label: "Agreement" },
  { key: "agreement_end_date", label: "Agreement end date" },
];

const initials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const commissionLabel = (d: Developer): string => {
  return d.commission_min === d.commission_max
    ? `${d.default_commission}%`
    : `${d.commission_min}–${d.commission_max}%`;
};
</script>
