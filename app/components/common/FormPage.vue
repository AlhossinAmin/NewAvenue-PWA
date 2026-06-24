<template>
  <UDashboardPanel :id="panelId">
    <template #header>
      <UDashboardNavbar :title="title">
        <template #leading>
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            aria-label="Back"
            :to="backTo"
          />
        </template>
        <template #right>
          <slot name="actions" />
          <UColorModeButton />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="w-full max-w-2xl">
        <slot />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
defineProps<{
  panelId: string;
  title: string;
  backTo: string;
}>();
</script>
