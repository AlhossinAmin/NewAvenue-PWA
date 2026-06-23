<template>
  <section class="flex flex-col gap-3">
    <h2 class="text-sm font-semibold text-highlighted">Specifications</h2>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <UFormField label="Total area (m²)" name="area">
        <UInput v-model.number="state.area" type="number" class="w-full" />
      </UFormField>

      <UFormField label="Built-up area (m²)" name="built_up_area">
        <UInput
          v-model.number="state.built_up_area"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Delivery year" name="delivery_year">
        <UInput
          v-model.number="state.delivery_year"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Bedrooms" name="num_bedrooms">
        <UInput
          v-model.number="state.num_bedrooms"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Bathrooms" name="num_bathrooms">
        <UInput
          v-model.number="state.num_bathrooms"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Amenities" name="amenities" class="sm:col-span-2">
        <UInputTags
          v-model="state.amenities"
          class="w-full"
          placeholder="Add amenity and press enter"
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
