<template>
  <div class="flex flex-col gap-3">
    <!-- Once a logo is present (either the existing URL from a read or a freshly
         uploaded media item) show a preview with a remove control. -->
    <div
      v-if="previewUrl"
      class="flex items-center gap-3 rounded-lg border border-default p-3"
    >
      <img
        alt="Selected image preview"
        class="size-16 shrink-0 rounded-md object-cover"
        :src="previewUrl"
      />
      <p class="min-w-0 flex-1 truncate text-sm font-medium">
        {{ uploading ? "Uploading…" : "Uploaded image" }}
      </p>
      <UButton
        label="Remove"
        color="neutral"
        variant="ghost"
        size="xs"
        icon="i-lucide-x"
        @click="onClear"
      />
    </div>

    <!-- Single-file upload through the media API. Unlike the plain ImageInput
         there's no paste-a-link: the value saved is a media id, not a URL. -->
    <template v-else>
      <UFileUpload
        v-model="file"
        accept="image/*,.svg,.avif"
        description="PNG, JPG, SVG or AVIF"
        icon="i-lucide-image-up"
        class="w-full"
        :label="label ?? 'Drag & drop or click to upload'"
        :disabled="uploading"
      />

      <p v-if="uploading" class="flex items-center gap-2 text-xs text-muted">
        <UIcon name="i-lucide-loader-circle" class="animate-spin" />
        Uploading…
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { MediaItem } from "~/types/common/media";

defineProps<{
  label?: string;
}>();

// Holds one of: a URL string (the existing logo from a read — has no id, so
// it's left untouched on save), a freshly uploaded MediaItem ({ id, url } —
// its id is what gets saved), or null (no logo / explicitly cleared).
const model = defineModel<MediaItem | string | null>();

const toast = useToast();
const { uploadMedia } = useMedia();

const file = ref<File | null>(null);
const uploading = ref(false);

const previewUrl = computed(() => {
  const value = model.value;
  if (!value) return "";
  return typeof value === "string" ? value : value.url;
});

// Upload the picked file to the media API; the returned { id, url } replaces the
// model so the parent can submit the id and preview the url.
watch(file, async (selected) => {
  if (!selected) return;
  const picked = selected;
  file.value = null;
  uploading.value = true;
  try {
    model.value = await uploadMedia(picked);
  } catch {
    toast.add({ title: "Failed to upload image", color: "error" });
  } finally {
    uploading.value = false;
  }
});

// Null (not "") so the parent can tell "cleared" from "untouched" and send
// logo: null to clear it server-side.
const onClear = () => {
  model.value = null;
  file.value = null;
};
</script>
