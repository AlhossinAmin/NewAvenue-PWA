<template>
  <UButton
    v-if="showButton"
    icon="i-lucide-download"
    color="primary"
    variant="soft"
    class="w-full"
    :label="collapsed ? undefined : 'Install app'"
    :block="collapsed"
    @click="onInstall"
  />

  <UModal v-model:open="showIosHelp" title="Install Avenu">
    <template #body>
      <div class="space-y-3 text-sm">
        <p class="text-muted">
          Add Avenu to your home screen for a full-screen, app-like experience.
        </p>
        <ol class="space-y-2">
          <li class="flex items-center gap-2">
            <span class="font-medium">1.</span>
            <span class="flex items-center gap-1">
              Tap the Share button
              <UIcon name="i-lucide-share" class="size-4" />
            </span>
          </li>
          <li class="flex items-center gap-2">
            <span class="font-medium">2.</span>
            <span>Scroll down and tap "Add to Home Screen"</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="font-medium">3.</span>
            <span>Tap "Add" to confirm</span>
          </li>
        </ol>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
defineProps<{
  collapsed?: boolean;
}>();

// `$pwa` is undefined when the PWA is disabled (e.g. in dev) or unsupported.
const { $pwa } = useNuxtApp();

const isIos = ref(false);
const isStandalone = ref(false);
const showIosHelp = ref(false);

// iOS Safari never fires `beforeinstallprompt`, so `$pwa.showInstallPrompt`
// stays false there. Detect iOS and whether the app is already installed
// (running standalone) so we can offer manual "Add to Home Screen" steps.
const canInstall = computed(
  () => $pwa?.showInstallPrompt && !$pwa.isPWAInstalled,
);
const showIosButton = computed(() => isIos.value && !isStandalone.value);
const showButton = computed(() => canInstall.value || showIosButton.value);

onMounted(() => {
  const ua = window.navigator.userAgent;
  isIos.value = /iphone|ipad|ipod/i.test(ua);
  isStandalone.value =
    ("standalone" in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches;
});

const onInstall = async () => {
  if (showIosButton.value) {
    showIosHelp.value = true;
    return;
  }
  await $pwa?.install();
};
</script>
