<template>
  <div class="flex flex-col gap-3">
    <!-- Uploaded photos shown as a thumbnail grid; each can be removed
         individually. Removal is local only — the photo is simply left out of
         the next save, and the backend prunes any now-detached upload. -->
    <div v-if="photos.length" class="grid grid-cols-3 gap-3 sm:grid-cols-4">
      <div
        v-for="(photo, index) in photos"
        class="group relative aspect-square overflow-hidden rounded-lg border border-default"
        :key="photo.id"
      >
        <img
          alt="Uploaded photo"
          class="size-full object-cover"
          :src="photo.url"
        />
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="solid"
          size="xs"
          square
          class="absolute top-1 right-1"
          aria-label="Remove photo"
          @click="removeAt(index)"
        />
      </div>
    </div>

    <!-- Photos go through the media API on pick (no paste-a-link): each file is
         uploaded immediately and the returned id is what gets saved. -->
    <UFileUpload
      v-model="files"
      multiple
      accept="image/*,.svg,.avif"
      description="PNG, JPG, SVG or AVIF — multiple allowed"
      icon="i-lucide-images"
      class="w-full"
      :label="label ?? 'Drag & drop or click to upload'"
      :disabled="uploading"
    />

    <p v-if="uploading" class="flex items-center gap-2 text-xs text-muted">
      <UIcon name="i-lucide-loader-circle" class="animate-spin" />
      Uploading…
    </p>
  </div>
</template>

<script setup lang="ts">
import type { MediaItem } from "~/types/common/media";

defineProps<{
  label?: string;
}>();

const model = defineModel<MediaItem[]>({ default: () => [] });

const toast = useToast();
const { uploadMedia } = useMedia();

const files = ref<File[]>([]);
const uploading = ref(false);

const photos = computed(() => model.value ?? []);

// Upload each picked file to the media API and append the returned { id, url }
// to the model. Ids are submitted with the record; urls drive the previews.
watch(files, async (selected) => {
  if (!selected?.length) return;
  const picked = [...selected];
  // Reset the picker first so the same file can be re-selected later if removed.
  files.value = [];
  uploading.value = true;
  try {
    for (const file of picked) {
      const media = await uploadMedia(file);
      model.value = [...(model.value ?? []), media];
    }
  } catch {
    toast.add({ title: "Failed to upload photo", color: "error" });
  } finally {
    uploading.value = false;
  }
});

const removeAt = (index: number) => {
  model.value = (model.value ?? []).filter((_, i) => i !== index);
};
</script>
