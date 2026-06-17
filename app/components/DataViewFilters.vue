<template>
  <div class="flex flex-col gap-4 pb-4">
    <div v-for="f in displayFilters" :key="f.key" class="flex flex-col gap-1">
      <p class="px-1 text-xs font-medium text-muted">{{ f.label }}</p>

      <USelectMenu
        v-if="f.type === 'select'"
        v-model="values[f.key]"
        :items="f.options"
        multiple
        :placeholder="f.placeholder"
      />

      <div
        v-else-if="f.type === 'slider'"
        class="flex flex-col gap-2 px-1 pt-1"
      >
        <USlider
          :model-value="f.sliderModel"
          :min="f.min"
          :max="f.max"
          :step="f.step"
          @update:model-value="onSlider(f, $event)"
        />
        <div class="flex justify-between text-xs text-muted">
          <span>{{ f.sliderModel[0].toLocaleString() }}</span>
          <span>{{ f.sliderModel[1].toLocaleString() }}</span>
        </div>
      </div>

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

<script setup lang="ts">
interface ResolvedFilter {
  key: string;
  label: string;
  type: "select" | "range" | "slider";
  options: string[];
  placeholder: string;
  minPlaceholder: string;
  maxPlaceholder: string;
  min: number;
  max: number;
  step: number;
}

// `values` is the parent's shared reactive filter state, mutated in place via
// the v-models below. Each entry is a string[] for select fields or
// { min, max } for range/slider fields — typed as `any` since the shape is
// per-filter.
const props = defineProps<{
  filters: ResolvedFilter[];
  values: Record<string, any>;
  activeCount: number;
}>();

defineEmits<{ clear: [] }>();

const toNum = (x: unknown): number | null => {
  if (x === "" || x == null) return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
};

// Pre-derive each slider's [min, max] thumb positions so the template only
// reads properties — falling back to the filter's full bounds when the user
// hasn't constrained that edge yet (stored as an empty string).
const displayFilters = computed(() =>
  props.filters.map((f) => {
    const lo = toNum(props.values[f.key]?.min) ?? f.min;
    const hi = toNum(props.values[f.key]?.max) ?? f.max;
    return { ...f, sliderModel: [lo, hi] as [number, number] };
  }),
);

// Write thumb positions back as strings; clear an edge that sits at the full
// bound so it doesn't count as an active filter.
const onSlider = (f: ResolvedFilter, val: number[] | undefined) => {
  if (!val) return;
  const lo = val[0] ?? f.min;
  const hi = val[1] ?? f.max;
  props.values[f.key].min = lo <= f.min ? "" : String(lo);
  props.values[f.key].max = hi >= f.max ? "" : String(hi);
};
</script>
