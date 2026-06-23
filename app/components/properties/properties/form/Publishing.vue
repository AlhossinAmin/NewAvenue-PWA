<template>
  <section class="flex flex-col gap-3">
    <h2 class="text-sm font-semibold text-highlighted">Publishing</h2>
    <p class="text-xs text-muted">
      List where this property is published. Pick a destination, its status, and
      paste the listing link.
    </p>

    <!-- One row per publication: destination + status + link, with a remove
         button. An "Add" button appends another row (like phone numbers). -->
    <div class="flex flex-col gap-3">
      <div
        v-for="(publication, index) in state.publications"
        class="flex flex-col gap-2 sm:flex-row sm:items-start"
        :key="index"
      >
        <USelect
          v-model="publication.type"
          value-key="value"
          class="w-full sm:w-44"
          :items="PUBLICATION_TYPE_OPTIONS"
        />
        <USelect
          v-model="publication.status"
          value-key="value"
          class="w-full sm:w-40"
          :items="PUBLICATION_STATUS_OPTIONS"
        />
        <UInput
          v-model="publication.link"
          type="url"
          placeholder="https://…"
          class="w-full flex-1"
        />
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          square
          aria-label="Remove publication"
          @click="removeAt(index)"
        />
      </div>

      <p v-if="!state.publications.length" class="text-sm text-muted">
        Not published anywhere yet.
      </p>

      <UButton
        label="Add publication"
        icon="i-lucide-plus"
        color="neutral"
        variant="soft"
        size="sm"
        class="self-start"
        @click="addPublication"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  createPublication,
  PUBLICATION_STATUS_OPTIONS,
  PUBLICATION_TYPE_OPTIONS,
  type PropertyFormState,
} from "~/types/properties/properties";

const props = defineProps<{
  state: PropertyFormState;
}>();

const addPublication = () => {
  props.state.publications.push(createPublication());
};

const removeAt = (index: number) => {
  props.state.publications.splice(index, 1);
};
</script>
