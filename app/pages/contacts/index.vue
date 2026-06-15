<template>
  <ResourcePage
    panel-id="contacts"
    title="Contacts"
    icon="i-lucide-contact"
    new-label="New contact"
    create-to="/contacts/new"
  >
    <DataView
      :rows="contacts"
      :columns="columns"
      :sort-fields="sortFields"
      search-placeholder="Search contacts…"
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
                  :color="stateColor(row.current_state)"
                  variant="subtle"
                  size="sm"
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
            <a
              :href="`tel:${row.mobile_num}`"
              class="flex items-center gap-1.5"
            >
              <UIcon name="i-lucide-phone" class="size-4 shrink-0" />
              {{ row.mobile_num }}
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
          <UAvatar :text="row.original.initials" size="sm" />
          <span class="font-medium">{{ row.original.name }}</span>
        </div>
      </template>

      <template #current_state-cell="{ row }">
        <UBadge
          :color="stateColor(row.original.current_state)"
          variant="subtle"
        >
          {{ row.original.current_state }}
        </UBadge>
      </template>
    </DataView>
  </ResourcePage>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import {
  DUMMY_CONTACTS,
  type Contact,
  type ContactState,
} from "~/constants/dummy/contacts";

type ContactRow = Contact & { initials: string };

const contacts: ContactRow[] = DUMMY_CONTACTS.map((c) => ({
  ...c,
  initials: initials(c.name),
}));

const STATE_COLOR: Record<
  ContactState,
  "success" | "warning" | "neutral" | "primary"
> = {
  Active: "success",
  Cold: "warning",
  Inactive: "neutral",
  Converted: "primary",
};

function stateColor(state: ContactState) {
  return STATE_COLOR[state];
}

const columns: TableColumn<ContactRow>[] = [
  { accessorKey: "name", header: "Contact" },
  { accessorKey: "mobile_num", header: "Mobile" },
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

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
</script>
