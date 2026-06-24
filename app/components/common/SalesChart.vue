<template>
  <div class="relative w-full">
    <svg
      class="h-56 w-full touch-none overflow-visible select-none"
      preserveAspectRatio="none"
      :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`"
      @pointermove="onMove"
      @pointerleave="activeIndex = null"
    >
      <defs>
        <linearGradient x1="0" y1="0" x2="0" y2="1" :id="gradientId">
          <stop
            offset="0%"
            stop-color="var(--ui-primary)"
            stop-opacity="0.35"
          />
          <stop offset="100%" stop-color="var(--ui-primary)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- horizontal gridlines -->
      <line
        v-for="(y, index) in gridLines"
        stroke="var(--ui-border)"
        stroke-width="1"
        stroke-dasharray="4 6"
        vector-effect="non-scaling-stroke"
        :key="index"
        :x1="PAD_X"
        :x2="VIEW_W - PAD_X"
        :y1="y"
        :y2="y"
      />

      <!-- area fill -->
      <path :d="areaPath" :fill="`url(#${gradientId})`" />

      <!-- line -->
      <path
        fill="none"
        stroke="var(--ui-primary)"
        stroke-width="2.5"
        stroke-linejoin="round"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
        :d="linePath"
      />

      <!-- active marker -->
      <g v-if="activePoint">
        <line
          stroke="var(--ui-border-accented)"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
          :x1="activePoint.x"
          :x2="activePoint.x"
          :y1="PAD_TOP"
          :y2="VIEW_H - PAD_BOTTOM"
        />
        <circle
          r="5"
          fill="var(--ui-bg)"
          stroke="var(--ui-primary)"
          stroke-width="2.5"
          vector-effect="non-scaling-stroke"
          :cx="activePoint.x"
          :cy="activePoint.y"
        />
      </g>

      <!-- x-axis labels -->
      <text
        v-for="coord in coords"
        text-anchor="middle"
        fill="var(--ui-text-dimmed)"
        class="text-[11px]"
        :key="coord.label"
        :x="coord.x"
        :y="VIEW_H - 8"
      >
        {{ coord.label }}
      </text>
    </svg>

    <!-- tooltip -->
    <div
      v-if="activePoint"
      class="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md border border-default bg-default px-2 py-1 text-center shadow-lg"
      :style="{ left: `${(activePoint.x / VIEW_W) * 100}%` }"
    >
      <p class="text-xs text-muted">{{ activePoint.label }}</p>
      <p class="text-sm font-semibold">{{ formatValue(activePoint.value) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ChartPoint {
  label: string;
  value: number;
}

const props = defineProps<{
  points: ChartPoint[];
  /** Formatter for the active point's value (defaults to localized number). */
  format?: (value: number) => string;
}>();

// Fixed coordinate system — the SVG stretches to its container via viewBox.
const VIEW_W = 600;
const VIEW_H = 220;
const PAD_X = 8;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

const gradientId = useId();

const activeIndex = ref<number | null>(null);

const maxValue = computed(() =>
  Math.max(1, ...props.points.map((point) => point.value)),
);

const coords = computed(() => {
  const innerW = VIEW_W - PAD_X * 2;
  const innerH = VIEW_H - PAD_TOP - PAD_BOTTOM;
  const count = props.points.length;
  return props.points.map((point, index) => {
    const x = count === 1 ? VIEW_W / 2 : PAD_X + (index / (count - 1)) * innerW;
    const y = PAD_TOP + innerH - (point.value / maxValue.value) * innerH;
    return { x, y, ...point };
  });
});

const linePath = computed(() =>
  coords.value
    .map((coord, index) => `${index === 0 ? "M" : "L"} ${coord.x} ${coord.y}`)
    .join(" "),
);

const areaPath = computed(() => {
  if (!coords.value.length) return "";
  const baseline = VIEW_H - PAD_BOTTOM;
  const first = coords.value[0]!;
  const last = coords.value[coords.value.length - 1]!;
  return `${linePath.value} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
});

const gridLines = computed(() => {
  const innerH = VIEW_H - PAD_TOP - PAD_BOTTOM;
  return [0, 0.25, 0.5, 0.75, 1].map((ratio) => PAD_TOP + innerH * ratio);
});

const activePoint = computed(() =>
  activeIndex.value === null ? null : coords.value[activeIndex.value],
);

const formatValue = (value: number) =>
  props.format ? props.format(value) : value.toLocaleString();

const onMove = (event: PointerEvent) => {
  const target = event.currentTarget as SVGElement;
  const rect = target.getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  const index = Math.round(ratio * (props.points.length - 1));
  activeIndex.value = Math.min(Math.max(index, 0), props.points.length - 1);
};
</script>
