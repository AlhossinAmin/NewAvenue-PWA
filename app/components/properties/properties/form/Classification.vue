<template>
  <section class="flex flex-col gap-3">
    <h2 class="text-sm font-semibold text-highlighted">Classification</h2>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <UFormField label="Category" name="category" required>
        <USelect
          v-model="state.category"
          class="w-full"
          placeholder="Select…"
          :items="CATEGORY_OPTIONS"
        />
      </UFormField>

      <!-- The available types depend on the selected category (see
           PROPERTY_TYPES_BY_CATEGORY). Stays disabled until a category is
           picked; changing the category clears a now-invalid type (handled in
           the form's category watcher). -->
      <UFormField label="Type" name="type" required>
        <USelect
          v-model="state.type"
          class="w-full"
          placeholder="Select…"
          :items="typeOptions"
          :disabled="!state.category"
        />
      </UFormField>

      <UFormField label="Offering type" name="transaction_type" required>
        <USelect
          v-model="state.transaction_type"
          value-key="value"
          class="w-full"
          placeholder="Select…"
          :items="TRANSACTION_OPTIONS"
        />
      </UFormField>

      <!-- A sale can be linked to a developer project (optional); a rental has
           no project. Both offerings name a seller contact — required for rent,
           and required for a sale only when no project is linked. -->
      <UFormField
        v-if="state.transaction_type === 'sell'"
        label="Project"
        name="project"
      >
        <PropertiesProjectsSelect v-model="state.project" />
      </UFormField>

      <UFormField
        v-if="state.transaction_type"
        label="Seller"
        name="seller"
        :required="state.transaction_type === 'rent'"
      >
        <CrmContactsSelect
          v-model="state.seller"
          placeholder="Select seller contact…"
        />
      </UFormField>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  PropertyCategory,
  PropertyFormState,
  TransactionType,
} from "~/types/properties/properties";
import { PROPERTY_TYPES_BY_CATEGORY } from "~/constants/properties/property-types";

const props = defineProps<{
  state: PropertyFormState;
}>();

const CATEGORY_OPTIONS: PropertyCategory[] = ["Residential", "Commercial"];

// Types offered for the currently selected category — empty until one is picked.
const typeOptions = computed(() =>
  props.state.category ? PROPERTY_TYPES_BY_CATEGORY[props.state.category] : [],
);
const TRANSACTION_OPTIONS: { label: string; value: TransactionType }[] = [
  { label: "For Sale", value: "sell" },
  { label: "For Rent", value: "rent" },
];
</script>
