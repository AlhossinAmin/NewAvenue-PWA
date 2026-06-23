<template>
  <section class="flex flex-col gap-3">
    <h2 class="text-sm font-semibold text-highlighted">Characteristics</h2>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <!-- View/orientation is Residential-only; the form's category watcher
           clears a stale value when the category changes away from Residential. -->
      <UFormField
        v-if="state.category === 'Residential'"
        label="View / Orientation"
        name="orientation"
      >
        <USelect
          v-model="state.orientation"
          value-key="value"
          class="w-full"
          placeholder="Select…"
          :items="ORIENTATION_OPTIONS"
        />
      </UFormField>

      <UFormField label="Finishing" name="finishing">
        <USelect
          v-model="state.finishing"
          value-key="value"
          class="w-full"
          placeholder="Select…"
          :items="FINISHING_OPTIONS"
        />
      </UFormField>

      <UFormField label="Furnishing" name="furnishing">
        <USelect
          v-model="state.furnishing"
          value-key="value"
          class="w-full"
          placeholder="Select…"
          :items="FURNISHING_OPTIONS"
        />
      </UFormField>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  FINISHING_OPTIONS,
  FURNISHING_OPTIONS,
  ORIENTATION_OPTIONS,
  type PropertyFormState,
} from "~/types/properties/properties";

defineProps<{
  state: PropertyFormState;
}>();
</script>
