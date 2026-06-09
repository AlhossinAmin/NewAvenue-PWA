<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const links: NavigationMenuItem[][] = [
  [
    { label: "Home", icon: "i-lucide-house", to: "/" },
    { label: "Customers", icon: "i-lucide-users", to: "/customers" },
    { label: "Orders", icon: "i-lucide-shopping-cart", to: "/orders" },
    { label: "Products", icon: "i-lucide-box", to: "/products" },
    { label: "Settings", icon: "i-lucide-settings", to: "/settings" },
  ],
  [
    {
      label: "Documentation",
      icon: "i-lucide-book-open",
      to: "https://ui.nuxt.com",
      target: "_blank",
    },
  ],
];
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible resizable>
      <template #header="{ collapsed }">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-layout-dashboard" class="size-6 shrink-0" />
          <span v-if="!collapsed" class="text-lg font-bold">Avenu</span>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" />
        <UNavigationMenu
          :items="links"
          :collapsed="collapsed"
          orientation="vertical"
        />
      </template>

      <template #footer="{ collapsed }">
        <UButton
          :avatar="{ src: 'https://github.com/nuxt.png' }"
          :label="collapsed ? undefined : 'Admin'"
          color="neutral"
          variant="ghost"
          class="w-full"
          :block="collapsed"
        />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
