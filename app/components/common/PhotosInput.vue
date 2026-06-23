<template>
  <div class="flex flex-col gap-3">
    <!-- One card per photo inside a single drop box. Finished uploads show the
         image (click to preview, hover to remove); in-flight uploads show their
         own spinner over a faded local preview, so more files can be added
         while others are still uploading. -->
    <div
      class="grid grid-cols-3 gap-3 rounded-lg border border-dashed p-3 transition sm:grid-cols-4"
      :class="dragging ? 'border-primary bg-elevated' : 'border-default'"
      @dragenter.prevent="dragging = true"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <div
        v-for="(photo, index) in photos"
        class="group relative aspect-square overflow-hidden rounded-lg border border-default"
        :key="`done-${photo.id}`"
      >
        <button
          type="button"
          class="block size-full cursor-zoom-in"
          aria-label="Preview photo"
          @click="openPreview(index)"
        >
          <img
            alt="Uploaded photo"
            class="size-full object-cover"
            :src="photo.url"
          />
          <span
            class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100"
          >
            <UIcon name="i-lucide-eye" class="size-6 text-white" />
          </span>
        </button>
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

      <div
        v-for="item in pending"
        class="relative aspect-square overflow-hidden rounded-lg border border-default"
        :key="`pending-${item.id}`"
      >
        <img
          alt=""
          class="size-full object-cover opacity-30"
          :src="item.preview_url"
        />
        <div
          class="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center"
        >
          <UIcon
            v-if="item.status === 'uploading'"
            name="i-lucide-loader-circle"
            class="size-5 animate-spin text-muted"
          />
          <template v-else>
            <UIcon name="i-lucide-triangle-alert" class="size-5 text-error" />
            <UButton
              label="Retry"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="retry(item.id)"
            />
          </template>
        </div>
        <UButton
          v-if="item.status === 'error'"
          icon="i-lucide-x"
          color="neutral"
          variant="solid"
          size="xs"
          square
          class="absolute top-1 right-1"
          aria-label="Discard upload"
          @click="discard(item.id)"
        />
      </div>

      <button
        type="button"
        class="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-default text-muted transition hover:border-primary hover:text-primary"
        :aria-label="label ?? 'Add photos'"
        @click="pick"
      >
        <UIcon name="i-lucide-image-plus" class="size-6" />
        <span class="text-xs">Add</span>
      </button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*,.svg,.avif"
      multiple
      class="hidden"
      @change="onInputChange"
    />

    <ImagePreviewModal
      v-model:open="previewOpen"
      v-model:index="previewIndex"
      :images="previewUrls"
    />
  </div>
</template>

<script setup lang="ts">
import type { MediaItem } from "~/types/common/media";

defineProps<{
  label?: string;
}>();

const model = defineModel<MediaItem[]>({ default: () => [] });

// A file being uploaded: an object-URL preview shown faded behind its own
// spinner until the media API returns, at which point it moves into `model`.
interface PendingUpload {
  id: number;
  file: File;
  preview_url: string;
  status: "uploading" | "error";
}

const toast = useToast();
const { uploadMedia } = useMedia();

const fileInput = ref<HTMLInputElement | null>(null);
const pending = ref<PendingUpload[]>([]);
const dragging = ref(false);
const previewOpen = ref(false);
const previewIndex = ref(0);
let tempId = 0;

const photos = computed(() => model.value ?? []);
const previewUrls = computed(() => photos.value.map((photo) => photo.url));

const pick = () => fileInput.value?.click();

const onInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) addFiles(input.files);
  // Reset so the same file can be re-selected after a remove/retry.
  input.value = "";
};

const onDrop = (event: DragEvent) => {
  dragging.value = false;
  if (event.dataTransfer?.files) addFiles(event.dataTransfer.files);
};

// Queue each picked image as its own pending card and upload it independently,
// so uploads run concurrently and the picker stays usable throughout.
const addFiles = (fileList: FileList) => {
  for (const file of Array.from(fileList)) {
    if (!file.type.startsWith("image/")) continue;
    const item: PendingUpload = {
      id: ++tempId,
      file,
      preview_url: URL.createObjectURL(file),
      status: "uploading",
    };
    pending.value = [...pending.value, item];
    upload(item.id);
  }
};

const upload = async (id: number) => {
  const item = pending.value.find((entry) => entry.id === id);
  if (!item) return;
  item.status = "uploading";
  try {
    const media = await uploadMedia(item.file);
    model.value = [...(model.value ?? []), media];
    removePending(id);
  } catch {
    const failed = pending.value.find((entry) => entry.id === id);
    if (failed) failed.status = "error";
    toast.add({ title: "Failed to upload photo", color: "error" });
  }
};

const retry = (id: number) => upload(id);

const removePending = (id: number) => {
  const item = pending.value.find((entry) => entry.id === id);
  if (item) URL.revokeObjectURL(item.preview_url);
  pending.value = pending.value.filter((entry) => entry.id !== id);
};

const discard = (id: number) => removePending(id);

const openPreview = (index: number) => {
  previewIndex.value = index;
  previewOpen.value = true;
};

const removeAt = (index: number) => {
  model.value = (model.value ?? []).filter((_, i) => i !== index);
};

// Release any object URLs still held by in-flight previews on teardown.
onUnmounted(() => {
  for (const item of pending.value) URL.revokeObjectURL(item.preview_url);
});
</script>
