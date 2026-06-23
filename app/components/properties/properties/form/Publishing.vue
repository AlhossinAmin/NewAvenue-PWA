<template>
  <section class="flex flex-col gap-3">
    <h2 class="text-sm font-semibold text-highlighted">Publishing</h2>
    <p class="text-xs text-muted">
      Set where this listing stands on each external website.
    </p>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <UFormField
        v-for="platform in PUBLISHING_PLATFORMS"
        :key="platform.key"
        :name="`publications.${platform.key}`"
      >
        <template #label>
          <span class="flex items-center gap-1.5">
            <UIcon class="size-4" :name="platform.icon" />
            {{ platform.label }}
          </span>
        </template>

        <USelect
          v-model="state.publications[platform.key]"
          value-key="value"
          class="w-full"
          :items="PUBLICATION_STATUS_OPTIONS"
        />
      </UFormField>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  PUBLICATION_STATUS_OPTIONS,
  PUBLISHING_PLATFORMS,
  type PropertyFormState,
} from "~/types/properties/properties";

defineProps<{
  state: PropertyFormState;
}>();
</script>
