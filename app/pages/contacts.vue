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

const stateColor: Record<
  ContactState,
  "success" | "warning" | "neutral" | "primary"
> = {
  Active: "success",
  Cold: "warning",
  Inactive: "neutral",
  Converted: "primary",
};

const columns: TableColumn<ContactRow>[] = [
  { accessorKey: "name", header: "Contact" },
  { accessorKey: "mobile_num", header: "Mobile" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "age", header: "Age" },
  { accessorKey: "current_state", header: "State" },
  { accessorKey: "last_activity_date", header: "Last activity" },
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

<template>
  <ResourcePage
    panel-id="contacts"
    title="Contacts"
    icon="i-lucide-contact"
    new-label="New contact"
  >
    <!-- Mobile-first: card list on small screens -->
    <div class="flex flex-col gap-2 sm:hidden">
      <UCard v-for="c in contacts" :key="c.id">
        <div class="flex items-center gap-3">
          <UAvatar :text="c.initials" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="truncate font-medium">{{ c.name }}</p>
              <UBadge
                :color="stateColor[c.current_state]"
                variant="subtle"
                size="sm"
              >
                {{ c.current_state }}
              </UBadge>
            </div>
            <p class="truncate text-sm text-muted">{{ c.email }}</p>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between text-sm text-muted">
          <a :href="`tel:${c.mobile_num}`" class="flex items-center gap-1.5">
            <UIcon name="i-lucide-phone" class="size-4 shrink-0" />
            {{ c.mobile_num }}
          </a>
          <span class="flex items-center gap-1.5">
            <UIcon name="i-lucide-clock" class="size-4 shrink-0" />
            {{ c.last_activity_date }}
          </span>
        </div>
      </UCard>
    </div>

    <!-- Table on larger screens -->
    <div class="hidden sm:block">
      <UTable :data="contacts" :columns="columns">
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :text="row.original.initials" size="sm" />
            <span class="font-medium">{{ row.original.name }}</span>
          </div>
        </template>

        <template #current_state-cell="{ row }">
          <UBadge
            :color="stateColor[row.original.current_state]"
            variant="subtle"
          >
            {{ row.original.current_state }}
          </UBadge>
        </template>
      </UTable>
    </div>
  </ResourcePage>
</template>
