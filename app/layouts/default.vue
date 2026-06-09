<script setup lang="ts">
import type { NavigationMenuItem, DropdownMenuItem } from "@nuxt/ui";
import logo from "~/assets/white-logo.svg";

const { user, logout } = useAuth();

async function onLogout() {
  logout();
  await navigateTo("/login");
}

const userMenu: DropdownMenuItem[][] = [
  [{ label: user.value ?? "admin", type: "label" }],
  [
    {
      label: "Sign out",
      icon: "i-lucide-log-out",
      onSelect: onLogout,
    },
  ],
];

const links: NavigationMenuItem[][] = [
  [{ label: "Home", icon: "i-lucide-house", to: "/" }],
  [
    { label: "Properties", type: "label" },
    { label: "Developers", icon: "i-lucide-building-2", to: "/developers" },
    { label: "Projects", icon: "i-lucide-layout-grid", to: "/projects" },
    { label: "Properties", icon: "i-lucide-home", to: "/properties" },
  ],
  [
    { label: "CRM", type: "label" },
    { label: "Contacts", icon: "i-lucide-contact", to: "/contacts" },
    { label: "Leads", icon: "i-lucide-user-plus", to: "/leads" },
  ],
  [
    { label: "HR", type: "label" },
    { label: "Roles", icon: "i-lucide-shield", to: "/roles" },
    { label: "Members", icon: "i-lucide-users", to: "/members" },
  ],
];
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible resizable>
      <template #header="{ collapsed }">
        <div class="flex items-center gap-2">
          <UIcon
            v-if="collapsed"
            name="i-lucide-layout-dashboard"
            class="size-6 shrink-0"
          />
          <img
            v-else
            :src="logo"
            alt="Avenu"
            class="h-7 w-auto invert dark:invert-0"
          />
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
        <UDropdownMenu
          :items="userMenu"
          :content="{ align: 'end', side: 'top' }"
          class="w-full"
        >
          <UButton
            :avatar="{ src: 'https://github.com/nuxt.png' }"
            :label="collapsed ? undefined : (user ?? 'admin')"
            :trailing-icon="collapsed ? undefined : 'i-lucide-chevron-up'"
            color="neutral"
            variant="ghost"
            class="w-full"
            :block="collapsed"
          />
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
