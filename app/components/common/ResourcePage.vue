<template>
  <UDashboardPanel :id="panelId">
    <template #header>
      <UDashboardNavbar :title="title" :icon="icon">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UColorModeButton />
          <UButton
            icon="i-lucide-plus"
            color="primary"
            class="hidden sm:inline-flex"
            :label="newLabel ?? 'New'"
            :to="createTo"
          />
          <UButton
            icon="i-lucide-plus"
            color="primary"
            square
            class="sm:hidden"
            :to="createTo"
            :aria-label="newLabel ?? 'New'"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <slot>
        <div
          class="flex flex-col items-center justify-center gap-3 py-16 text-center"
        >
          <UIcon class="size-10 text-dimmed" :name="icon" />
          <div>
            <p class="text-base font-medium">{{ title }}</p>
            <p class="text-sm text-muted">
              {{ description ?? `No ${title.toLowerCase()} yet.` }}
            </p>
          </div>
          <UButton
            icon="i-lucide-plus"
            :label="newLabel ?? `Create ${title}`"
            :to="createTo"
          />
        </div>
      </slot>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
defineProps<{
  panelId: string;
  title: string;
  icon: string;
  description?: string;
  newLabel?: string;
  createTo?: string;
}>();
</script>
