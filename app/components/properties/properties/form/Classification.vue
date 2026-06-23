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

      <UFormField label="Type" name="type" required>
        <UInput
          v-model="state.type"
          class="w-full"
          placeholder="e.g. Apartment"
        />
      </UFormField>

      <UFormField label="Offering type" name="transaction_type" required>
        <USelect
          v-model="state.transaction_type"
          class="w-full"
          placeholder="Select…"
          :items="TRANSACTION_OPTIONS"
        />
      </UFormField>

      <!-- A Primary unit links to an actual developer project; Resale/Rent
       offerings have no linked project — an individual seller is named. -->
      <UFormField
        v-if="state.transaction_type === 'Primary'"
        label="Project"
        name="project"
        required
      >
        <PropertiesProjectsSelect v-model="state.project" />
      </UFormField>

      <UFormField
        v-else-if="
          state.transaction_type === 'Resale' ||
          state.transaction_type === 'Rent'
        "
        label="Seller name"
        name="seller_name"
        required
      >
        <UInput
          v-model="state.seller_name"
          class="w-full"
          placeholder="Seller name"
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

defineProps<{
  state: PropertyFormState;
}>();

const CATEGORY_OPTIONS: PropertyCategory[] = ["Residential", "Commercial"];
const TRANSACTION_OPTIONS: TransactionType[] = ["Primary", "Resale", "Rent"];
</script>
