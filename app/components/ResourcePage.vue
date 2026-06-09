<script setup lang="ts">
defineProps<{
  panelId: string;
  title: string;
  icon: string;
  description?: string;
  newLabel?: string;
}>();
</script>

<template>
  <UDashboardPanel :id="panelId">
    <template #header>
      <UDashboardNavbar :title="title" :icon="icon">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            :label="newLabel ?? `New`"
            icon="i-lucide-plus"
            color="primary"
            class="hidden sm:inline-flex"
          />
          <UButton
            icon="i-lucide-plus"
            color="primary"
            square
            class="sm:hidden"
            :aria-label="newLabel ?? 'New'"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Page content; falls back to an empty state placeholder. -->
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
            icon="i-lucide-plus"
          />
        </div>
      </slot>
    </template>
  </UDashboardPanel>
</template>
