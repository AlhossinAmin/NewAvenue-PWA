<template>
  <section class="flex flex-col gap-3">
    <h2 class="text-sm font-semibold text-highlighted">
      Media &amp; description
    </h2>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <UFormField label="Photos" name="photos" class="sm:col-span-2">
        <PhotosInput v-model="state.photos" label="Photos" />
      </UFormField>

      <UFormField label="Description" name="description" class="sm:col-span-2">
        <UTextarea
          v-model="state.description"
          class="w-full"
          placeholder="Short description"
          :rows="3"
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
