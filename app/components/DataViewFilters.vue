<script setup lang="ts">
interface ResolvedFilter {
  key: string;
  label: string;
  type: "select" | "range";
  options: string[];
  placeholder: string;
  minPlaceholder: string;
  maxPlaceholder: string;
}

// `values` is the parent's shared reactive filter state, mutated in place via
// the v-models below. Each entry is a string[] for select fields or
// { min, max } for range fields — typed as `any` since the shape is per-filter.
defineProps<{
  filters: ResolvedFilter[];
  values: Record<string, any>;
  activeCount: number;
}>();

defineEmits<{ clear: [] }>();
</script>

<template>
  <div class="flex flex-col gap-4 pb-4">
    <div v-for="f in filters" :key="f.key" class="flex flex-col gap-1">
      <p class="px-1 text-xs font-medium text-muted">{{ f.label }}</p>

      <USelectMenu
        v-if="f.type === 'select'"
        v-model="values[f.key]"
        :items="f.options"
        multiple
        :placeholder="f.placeholder"
      />

      <div v-else class="flex items-center gap-2">
        <UInput
          v-model="values[f.key].min"
          type="number"
          :placeholder="f.minPlaceholder"
          class="flex-1"
        />
        <span class="text-muted">–</span>
        <UInput
          v-model="values[f.key].max"
          type="number"
          :placeholder="f.maxPlaceholder"
          class="flex-1"
        />
      </div>
    </div>

    <UButton
      v-if="activeCount"
      label="Clear filters"
      color="neutral"
      variant="link"
      block
      @click="$emit('clear')"
    />
  </div>
</template>
