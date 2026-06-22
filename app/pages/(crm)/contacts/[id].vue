<template>
  <FormPage
    panel-id="contacts-edit"
    back-to="/contacts"
    :title="record ? `Edit contact` : `Contact not found`"
  >
    <div
      v-if="!record"
      class="flex flex-col items-center gap-3 py-16 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-10 text-dimmed" />
      <p class="text-sm text-muted">This contact does not exist.</p>
      <UButton label="Back to contacts" to="/contacts" />
    </div>

    <div v-else class="flex flex-col gap-8">
      <CrmContactsForm :record="record" />

      <section class="flex flex-col gap-3">
        <h2 class="text-sm font-semibold text-highlighted">
          Leads ({{ linkedLeads.length }})
        </h2>
        <p v-if="!linkedLeads.length" class="text-sm text-muted">
          No leads linked to this contact.
        </p>
        <ULink
          v-for="lead in linkedLeads"
          class="block"
          :key="lead.id"
          :to="`/leads/${lead.id}`"
        >
          <UCard class="transition hover:bg-elevated" :ui="{ body: 'sm:p-4' }">
            <div class="flex items-center justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate font-medium">{{ lead.title }}</p>
                <p class="truncate text-sm text-muted">{{ lead.subtitle }}</p>
              </div>
              <UBadge variant="subtle" size="sm" :color="lead.state_color">
                {{ lead.current_state }}
              </UBadge>
            </div>
          </UCard>
        </ULink>
      </section>

      <section class="flex flex-col gap-3">
        <h2 class="text-sm font-semibold text-highlighted">
          Properties ({{ linkedProperties.length }})
        </h2>
        <p v-if="!linkedProperties.length" class="text-sm text-muted">
          No properties linked to this contact.
        </p>
        <ULink
          v-for="property in linkedProperties"
          class="block"
          :key="property.id"
          :to="`/properties/${property.id}`"
        >
          <UCard class="transition hover:bg-elevated" :ui="{ body: 'sm:p-4' }">
            <div class="flex items-center justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate font-medium">{{ property.title }}</p>
                <p class="truncate text-sm text-muted">
                  {{ property.subtitle }}
                </p>
              </div>
              <span class="shrink-0 font-semibold">
                {{ property.price_label }}
              </span>
            </div>
          </UCard>
        </ULink>
      </section>
    </div>
  </FormPage>
</template>

<script setup lang="ts">
import { DUMMY_LEADS } from "~/constants/crm/leads";
import type { LeadState } from "~/types/crm/leads";
import { DUMMY_PROPERTIES } from "~/constants/properties/properties";

const route = useRoute();

const id = route.params.id as string;
const { fetchContact } = useContacts();

const { data: record } = await useAsyncData(`contact-${id}`, () =>
  fetchContact(id).catch(() => null),
);

const priceFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const STATE_COLOR: Record<
  LeadState,
  "info" | "neutral" | "warning" | "error" | "success" | "primary"
> = {
  New: "info",
  Cold: "neutral",
  Warm: "warning",
  Hot: "error",
  "In Progress": "primary",
  "On Hold": "neutral",
  "Closed Won": "success",
  "Closed Lost": "error",
};

// Leads whose customer is this contact, shaped into display-ready rows.
const linkedLeads = computed(() =>
  DUMMY_LEADS.filter((lead) => lead.customer.id === record.value?.id).map(
    (lead) => ({
      id: lead.id,
      current_state: lead.current_state,
      state_color: STATE_COLOR[lead.current_state],
      title: `${lead.property_type} · ${lead.offering_type}`,
      subtitle: [lead.neighborhood, lead.district].filter(Boolean).join(", "),
    }),
  ),
);

// Properties assigned to this contact's leads (deduped), as display-ready rows.
const linkedProperties = computed(() => {
  const ids = new Set(
    DUMMY_LEADS.filter((lead) => lead.customer.id === record.value?.id)
      .map((lead) => lead.assigned_property)
      .filter((id): id is string => Boolean(id)),
  );
  return DUMMY_PROPERTIES.filter((property) => ids.has(property.id)).map(
    (property) => ({
      id: property.id,
      title: `${property.compound} · Unit ${property.unit_num}`,
      subtitle: `${property.type} · ${property.district}, ${property.city}`,
      price_label: `EGP ${priceFormatter.format(property.price)}`,
    }),
  );
});
</script>
