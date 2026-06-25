<template>
  <section class="flex flex-col gap-3">
    <h2 class="text-sm font-semibold text-highlighted">Rent terms</h2>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <UFormField label="Rent price (EGP / m²)" name="rent_price_per_sqm">
        <UInput
          v-model.number="state.rent_price_per_sqm"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Service charge (EGP / m²)"
        name="service_charge_per_sqm"
      >
        <UInput
          v-model.number="state.service_charge_per_sqm"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Advance (months)" name="advance_months">
        <UInput
          v-model.number="state.advance_months"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Insurance (months)" name="insurance_months">
        <UInput
          v-model.number="state.insurance_months"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Escalation rate (%)" name="escalation_rate">
        <UInput
          v-model.number="state.escalation_rate"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Payment terms" name="payment_terms">
        <USelect
          v-model="state.payment_terms"
          value-key="value"
          class="w-full"
          placeholder="Select…"
          :items="PAYMENT_TERMS_OPTIONS"
        />
      </UFormField>

      <UFormField
        label="Contract period (min years)"
        name="contract_period_min_years"
      >
        <UInput
          v-model.number="state.contract_period_min_years"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Contract period (max years)"
        name="contract_period_max_years"
      >
        <UInput
          v-model.number="state.contract_period_max_years"
          type="number"
          class="w-full"
        />
      </UFormField>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  PAYMENT_TERMS_OPTIONS,
  type PropertyFormState,
} from "~/types/properties/properties";

defineProps<{
  state: PropertyFormState;
}>();
</script>
