<template>
  <UApp>
    <VitePwaManifest />
    <NuxtPwaAssets />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const colorMode = useColorMode();

// Color shown on the mobile status bar / notch area in the installed PWA.
// Kept in sync with the actual page background so it matches the active theme.
const themeColor = ref("#ffffff");

useHead({
  meta: [{ name: "theme-color", content: () => themeColor.value }],
});

const syncThemeColor = () => {
  // Resolve the live `--ui-bg` value to a concrete rgb() string by probing it
  // off a throwaway element, so the bar matches whatever the theme renders.
  const probe = document.createElement("div");
  probe.style.cssText = "background-color: var(--ui-bg)";
  document.body.appendChild(probe);
  const bg = getComputedStyle(probe).backgroundColor;
  probe.remove();
  if (bg) themeColor.value = bg;
}

onMounted(() => {
  syncThemeColor();
  watch(
    () => colorMode.value,
    () => nextTick(syncThemeColor),
  );
});
</script>
