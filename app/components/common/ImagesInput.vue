<template>
  <div class="flex flex-col gap-3">
    <!-- Selected images shown as a thumbnail grid; each can be removed
         individually, mirroring how galleries (Drive/Photos) confirm a
         multi-select visually before proceeding. -->
    <div v-if="images.length" class="grid grid-cols-3 gap-3 sm:grid-cols-4">
      <div
        v-for="(src, index) in images"
        class="group relative aspect-square overflow-hidden rounded-lg border border-default"
        :key="index"
      >
        <img alt="Selected image" class="size-full object-cover" :src="src" />
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="solid"
          size="xs"
          square
          class="absolute top-1 right-1"
          aria-label="Remove image"
          @click="removeAt(index)"
        />
      </div>
    </div>

    <!-- Upload (multiple) and paste-a-link stay visible side by side, matching
         the single-image ImageInput so both sources are always reachable. -->
    <UFileUpload
      v-model="files"
      multiple
      accept="image/*"
      description="PNG, JPG or SVG — multiple allowed"
      icon="i-lucide-images"
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
      :placeholder="placeholder ?? 'https://example.com/photo.jpg'"
      @change="commitUrl"
      @keydown.enter.prevent="commitUrl"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string;
  placeholder?: string;
}>();

const model = defineModel<string[]>({ default: () => [] });

const files = ref<File[]>([]);
const urlDraft = ref("");

const images = computed(() => model.value ?? []);

// When files are picked, store each as a data URL so every value stays a plain
// string — interchangeable with pasted URLs for previewing and persistence.
watch(files, (selected) => {
  if (!selected?.length) return;
  for (const selectedFile of selected) {
    const reader = new FileReader();
    reader.onload = () => {
      model.value = [...(model.value ?? []), reader.result as string];
    };
    reader.readAsDataURL(selectedFile);
  }
  // Reset the picker so the same file can be re-selected later if removed.
  files.value = [];
});

const commitUrl = () => {
  const url = urlDraft.value.trim();
  if (!url) return;
  model.value = [...(model.value ?? []), url];
  urlDraft.value = "";
};

const removeAt = (index: number) => {
  model.value = (model.value ?? []).filter((_, i) => i !== index);
};
</script>
