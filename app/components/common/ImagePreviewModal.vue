<template>
  <UModal v-model:open="open" :title="title" :ui="{ content: 'sm:max-w-3xl' }">
    <template #body>
      <div class="flex flex-col gap-3">
        <div
          class="relative flex items-center justify-center overflow-hidden rounded-lg bg-elevated"
        >
          <img
            v-if="currentImage"
            alt="Photo preview"
            class="max-h-[70vh] w-full object-contain"
            :src="currentImage"
          />

          <template v-if="hasMultiple">
            <UButton
              icon="i-lucide-chevron-left"
              color="neutral"
              variant="solid"
              size="lg"
              square
              class="absolute top-1/2 left-2 -translate-y-1/2"
              aria-label="Previous photo"
              @click="prev"
            />
            <UButton
              icon="i-lucide-chevron-right"
              color="neutral"
              variant="solid"
              size="lg"
              square
              class="absolute top-1/2 right-2 -translate-y-1/2"
              aria-label="Next photo"
              @click="next"
            />
          </template>
        </div>

        <p v-if="hasMultiple" class="text-center text-sm text-muted">
          {{ counterLabel }}
        </p>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    images: string[];
    title?: string;
  }>(),
  { title: "Preview" },
);

const open = defineModel<boolean>("open", { default: false });
const index = defineModel<number>("index", { default: 0 });

const hasMultiple = computed(() => props.images.length > 1);
const currentImage = computed(() => props.images[index.value] ?? "");
const counterLabel = computed(
  () => `${index.value + 1} of ${props.images.length}`,
);

// Keep the active index in range if the underlying list shrinks (e.g. a photo
// is removed) while the modal is open.
watch(
  () => props.images.length,
  (length) => {
    if (index.value > length - 1) index.value = Math.max(0, length - 1);
  },
);

const prev = () => {
  if (!props.images.length) return;
  index.value = (index.value - 1 + props.images.length) % props.images.length;
};
const next = () => {
  if (!props.images.length) return;
  index.value = (index.value + 1) % props.images.length;
};

// Arrow keys step through a multi-image gallery; Esc is handled by UModal.
const onKeydown = (event: KeyboardEvent) => {
  if (!open.value || !hasMultiple.value) return;
  if (event.key === "ArrowLeft") prev();
  else if (event.key === "ArrowRight") next();
};

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>
