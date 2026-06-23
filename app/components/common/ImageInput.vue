<template>
  <div class="flex flex-col gap-3">
    <!-- Once an image is chosen (from either source) show a preview with a
         remove control, mirroring Trello/Gmail which confirm the selection
         visually before letting the user proceed. Click the preview to open it
         full-size. -->
    <div v-if="hasImage" class="flex flex-col gap-3">
      <div
        class="group relative overflow-hidden rounded-lg border border-default bg-elevated"
      >
        <button
          type="button"
          class="block w-full cursor-zoom-in"
          aria-label="Preview image"
          @click="previewOpen = true"
        >
          <img
            alt="Selected image preview"
            class="max-h-64 w-full object-contain"
            :src="model"
          />
          <span
            class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100"
          >
            <UIcon name="i-lucide-eye" class="size-6 text-white" />
          </span>
        </button>
      </div>

      <div class="flex items-center gap-3">
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">{{ sourceLabel }}</p>
          <p class="truncate text-xs text-muted">{{ sourceDetail }}</p>
        </div>
        <UButton
          label="Remove"
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-lucide-x"
          @click="onClear"
        />
      </div>
    </div>

    <!-- Both sources stay visible side by side — neither is hidden behind a
         toggle — with upload as the prominent drag & drop primary action. -->
    <template v-else>
      <UFileUpload
        v-model="file"
        accept="image/*,.svg,.avif"
        description="PNG, JPG, SVG or AVIF"
        icon="i-lucide-image-up"
        class="w-full"
        :label="label ?? 'Drag & drop or click to upload'"
      />

      <div class="flex items-center gap-3 text-xs text-muted">
        <USeparator class="flex-1" />
        <span>or paste a link</span>
        <USeparator class="flex-1" />
      </div>

      <UInput
        v-model="urlDraft"
        type="url"
        icon="i-lucide-link"
        class="w-full"
        :placeholder="placeholder ?? 'https://example.com/logo.png'"
        @change="commitUrl"
        @keydown.enter.prevent="commitUrl"
      />
    </template>

    <ImagePreviewModal v-model:open="previewOpen" :images="previewImages" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string;
  placeholder?: string;
}>();

const model = defineModel<string>();

const file = ref<File | null>(null);
const urlDraft = ref("");
const previewOpen = ref(false);

const hasImage = computed(() => !!model.value);
const previewImages = computed(() => (model.value ? [model.value] : []));
const isDataUrl = computed(() => model.value?.startsWith("data:") ?? false);
const sourceLabel = computed(() =>
  isDataUrl.value ? "Uploaded image" : "Image from URL",
);
const sourceDetail = computed(() =>
  isDataUrl.value ? (file.value?.name ?? "Local file") : (model.value ?? ""),
);

// When a file is picked, store it as a data URL so the value stays a plain
// string — interchangeable with a pasted URL for previewing and persistence.
watch(file, (selected) => {
  if (!selected) return;
  const reader = new FileReader();
  reader.onload = () => {
    model.value = reader.result as string;
  };
  reader.readAsDataURL(selected);
});

const commitUrl = () => {
  const url = urlDraft.value.trim();
  if (url) model.value = url;
};

const onClear = () => {
  model.value = "";
  file.value = null;
  urlDraft.value = "";
};
</script>
