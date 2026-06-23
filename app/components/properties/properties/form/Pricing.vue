<template>
  <section class="flex flex-col gap-3">
    <h2 class="text-sm font-semibold text-highlighted">Pricing</h2>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <UFormField
        label="Installments available"
        name="installments_available"
        class="sm:col-span-2"
      >
        <USwitch v-model="state.installments_available" />
      </UFormField>

      <template v-if="state.installments_available">
        <UFormField label="Number of installments" name="num_installments">
          <UInput
            v-model.number="state.num_installments"
            type="number"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Installment value (EGP)" name="installment_value">
          <UInput
            v-model.number="state.installment_value"
            type="number"
            class="w-full"
          />
        </UFormField>
      </template>

      <UFormField label="Price (EGP)" name="price" required>
        <UInput v-model.number="state.price" type="number" class="w-full" />
      </UFormField>

      <UFormField label="Commission (%)" name="commission_scheme">
        <UInput
          v-model.number="state.commission_scheme"
          type="number"
          class="w-full"
        />
      </UFormField>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PropertyFormState } from "~/types/properties/properties";

defineProps<{
  state: PropertyFormState;
}>();
</script>
