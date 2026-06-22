<template>
  <ResourcePage
    panel-id="contacts"
    title="Contacts"
    icon="i-lucide-contact"
    new-label="New contact"
    create-to="/contacts/new"
  >
    <DataView
      v-model:page="page"
      v-model:search="search"
      v-model:sort="sort"
      server-side
      search-placeholder="Search contacts…"
      :rows="contacts"
      :columns="columns"
      :sort-fields="sortFields"
      :total="pagination?.total"
      :per-page="pagination?.per_page"
      :loading="status === 'pending'"
      :edit-to="(row) => `/contacts/${row.id}`"
    >
      <template #card="{ row }">
        <UCard>
          <div class="flex items-center gap-3">
            <UAvatar :text="row.initials" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <p class="truncate font-medium">{{ row.name }}</p>
                <UBadge
                  variant="subtle"
                  size="sm"
                  :color="stateColor(row.current_state)"
                >
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
      </template>

      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar size="sm" :text="row.original.initials" />
          <span class="font-medium">{{ row.original.name }}</span>
        </div>
      </template>

      <template #current_state-cell="{ row }">
        <UBadge
          variant="subtle"
          :color="stateColor(row.original.current_state)"
        >
          {{ row.original.current_state }}
        </UBadge>
      </template>
    </DataView>
  </ResourcePage>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Contact, ContactState } from "~/constants/dummy/contacts";

type ContactRow = Contact & {
  initials: string;
  mobile_label: string;
  mobile_tel: string;
};

const { fetchContacts } = useContacts();

const page = ref(1);
const search = ref("");
const sort = ref<string | null>("-created_at");

const { data, status, refresh } = useAsyncData(
  "contacts",
  () =>
    fetchContacts({ page: page.value, search: search.value, sort: sort.value }),
  { watch: [page] },
);

// Searching or re-sorting resets to the first page; if already there, refetch
// directly so the change still takes effect.
watch([search, sort], () => {
  if (page.value !== 1) page.value = 1;
  else refresh();
});

const initials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const contacts = computed<ContactRow[]>(() =>
  (data.value?.data ?? []).map((c) => {
    const primary = c.mobile_nums[0];
    return {
      ...c,
      initials: initials(c.name),
      mobile_label: primary ? `${primary.country_code} ${primary.number}` : "—",
      mobile_tel: primary ? `tel:${primary.country_code}${primary.number}` : "",
    };
  }),
);

const pagination = computed(() =>
  data.value && !Array.isArray(data.value.pagination)
    ? data.value.pagination
    : null,
);

const STATE_COLOR: Record<
  ContactState,
  "success" | "warning" | "neutral" | "primary"
> = {
  Active: "success",
  Cold: "warning",
  Inactive: "neutral",
  Converted: "primary",
};

const stateColor = (state: ContactState) => {
  return STATE_COLOR[state];
};

const columns: TableColumn<ContactRow>[] = [
  { accessorKey: "name", header: "Contact" },
  { accessorKey: "mobile_label", header: "Mobile" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "age", header: "Age" },
  { accessorKey: "current_state", header: "State" },
  { accessorKey: "last_activity_date", header: "Last activity" },
];

const sortFields = [
  { key: "name", label: "Name" },
  { key: "age", label: "Age" },
  { key: "current_state", label: "State" },
  { key: "last_activity_date", label: "Last activity" },
  { key: "date_created", label: "Date created" },
];
</script>
