<template>
  <FormPage
    panel-id="contacts-edit"
    :title="record ? `Edit contact` : `Contact not found`"
    back-to="/contacts"
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
      <ResourceForm
        :fields="CONTACT_FIELDS"
        :state="state"
        submit-label="Save changes"
        @submit="onSubmit"
      />

      <section class="flex flex-col gap-3">
        <h2 class="text-sm font-semibold text-highlighted">
          Leads ({{ linkedLeads.length }})
        </h2>
        <p v-if="!linkedLeads.length" class="text-sm text-muted">
          No leads linked to this contact.
        </p>
        <ULink
          v-for="lead in linkedLeads"
          :key="lead.id"
          :to="`/leads/${lead.id}`"
          class="block"
        >
          <UCard :ui="{ body: 'sm:p-4' }" class="transition hover:bg-elevated">
            <div class="flex items-center justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate font-medium">{{ lead.title }}</p>
                <p class="truncate text-sm text-muted">{{ lead.subtitle }}</p>
              </div>
              <UBadge :color="lead.state_color" variant="subtle" size="sm">
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
          :key="property.id"
          :to="`/properties/${property.id}`"
          class="block"
        >
          <UCard :ui="{ body: 'sm:p-4' }" class="transition hover:bg-elevated">
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
import { CONTACT_FIELDS } from "~/constants/forms";
import { DUMMY_CONTACTS } from "~/constants/dummy/contacts";
import { DUMMY_LEADS, type LeadState } from "~/constants/dummy/leads";
import { DUMMY_PROPERTIES } from "~/constants/dummy/properties";

const route = useRoute();
const toast = useToast();

const record = DUMMY_CONTACTS.find((item) => item.id === route.params.id);
const state = reactive<Record<string, unknown>>({ ...(record ?? {}) });

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
  DUMMY_LEADS.filter((lead) => lead.customer === record?.id).map((lead) => ({
    id: lead.id,
    current_state: lead.current_state,
    state_color: STATE_COLOR[lead.current_state],
    title: `${lead.property_type} · ${lead.offering_type}`,
    subtitle: [lead.neighborhood, lead.district].filter(Boolean).join(", "),
  })),
);

// Properties assigned to this contact's leads (deduped), as display-ready rows.
const linkedProperties = computed(() => {
  const ids = new Set(
    DUMMY_LEADS.filter((lead) => lead.customer === record?.id)
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

const onSubmit = () => {
  // Dummy data is static — surface success and return to the list.
  toast.add({ title: "Contact updated", color: "success" });
  navigateTo("/contacts");
};
</script>
