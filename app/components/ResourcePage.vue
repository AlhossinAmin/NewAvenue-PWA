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
            :label="newLabel ?? 'New'"
            :to="createTo"
            icon="i-lucide-plus"
            color="primary"
            class="hidden sm:inline-flex"
          />
          <UButton
            icon="i-lucide-plus"
            :to="createTo"
            color="primary"
            square
            class="sm:hidden"
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
          <UIcon :name="icon" class="size-10 text-dimmed" />
          <div>
            <p class="text-base font-medium">{{ title }}</p>
            <p class="text-sm text-muted">
              {{ description ?? `No ${title.toLowerCase()} yet.` }}
            </p>
          </div>
          <UButton
            :label="newLabel ?? `Create ${title}`"
            :to="createTo"
            icon="i-lucide-plus"
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
