<template>
  <section class="flex flex-col gap-3">
    <h2 class="text-sm font-semibold text-highlighted">Location</h2>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <UFormField label="Country" name="country">
        <UInput v-model="state.country" class="w-full" placeholder="Country" />
      </UFormField>

      <UFormField label="City" name="city">
        <UInput v-model="state.city" class="w-full" placeholder="City" />
      </UFormField>

      <UFormField label="District" name="district">
        <ComboboxInput v-model="state.district" :options="DISTRICT_OPTIONS" />
      </UFormField>

      <UFormField label="Neighborhood" name="neighborhood">
        <UInput
          v-model="state.neighborhood"
          class="w-full"
          placeholder="Neighborhood"
        />
      </UFormField>

      <UFormField label="Street" name="street">
        <UInput v-model="state.street" class="w-full" placeholder="Street" />
      </UFormField>
    </div>
  </section>
</template>

<script setup lang="ts">
import { DISTRICT_OPTIONS } from "~/constants/common/forms";
import type { PropertyFormState } from "~/types/properties/properties";

defineProps<{
  state: PropertyFormState;
}>();
</script>
