<script setup lang="ts">
defineProps<{ collapsed?: boolean }>();

// `$pwa` is undefined when the PWA is disabled (e.g. in dev) or unsupported.
const { $pwa } = useNuxtApp();

async function onInstall() {
  await $pwa?.install();
}
</script>

<template>
  <UButton
    v-if="$pwa?.showInstallPrompt && !$pwa.isPWAInstalled"
    icon="i-lucide-download"
    :label="collapsed ? undefined : 'Install app'"
    color="primary"
    variant="soft"
    class="w-full"
    :block="collapsed"
    @click="onInstall"
  />
</template>
