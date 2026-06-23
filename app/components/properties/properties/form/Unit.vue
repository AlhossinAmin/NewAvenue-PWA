<template>
  <section class="flex flex-col gap-3">
    <h2 class="text-sm font-semibold text-highlighted">Unit details</h2>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <!-- Unit identity: the three numeric parts plus the type feed the
           read-only "Unit" code below. -->
      <UFormField label="Building number" name="building_num" required>
        <UInput
          v-model.number="state.building_num"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Floor number" name="floor_num" required>
        <UInput v-model.number="state.floor_num" type="number" class="w-full" />
      </UFormField>

      <UFormField label="Unit number" name="unit_number" required>
        <UInput
          v-model.number="state.unit_number"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Unit" name="unit_num">
        <UInput
          readonly
          disabled
          placeholder="Auto-generated"
          class="w-full"
          :model-value="unitNum"
        />
      </UFormField>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PropertyFormState } from "~/types/properties/properties";

defineProps<{
  state: PropertyFormState;
  unitNum: string;
}>();
</script>
