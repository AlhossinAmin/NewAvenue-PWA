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
            alt="Avenu"
            class="h-7 w-auto invert dark:invert-0"
            :src="logo"
          />
        </div>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" />
        <UNavigationMenu
          orientation="vertical"
          :items="links"
          :collapsed="collapsed"
        />
      </template>

      <template #footer="{ collapsed }">
        <PwaInstallButton class="mb-2" :collapsed="collapsed" />
        <UDropdownMenu
          class="w-full"
          :items="userMenu"
          :content="{ align: 'end', side: 'top' }"
        >
          <UButton
            color="neutral"
            variant="ghost"
            class="w-full"
            :avatar="{ src: 'https://github.com/nuxt.png' }"
            :label="collapsed ? undefined : (user?.name ?? 'User')"
            :trailing-icon="collapsed ? undefined : 'i-lucide-chevron-up'"
            :block="collapsed"
          />
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { NavigationMenuItem, DropdownMenuItem } from "@nuxt/ui";
import logo from "~/assets/white-logo.svg";

const { user, isLoggedIn, fetchMe, logout } = useUser();
const colorMode = useColorMode();

// Restore the signed-in member after a hard reload — the token cookie survives
// but the in-memory profile does not.
onMounted(() => {
  if (isLoggedIn.value && !user.value) fetchMe();
});

const onLogout = async () => {
  await logout();
  await navigateTo("/login");
};

const themeItems: DropdownMenuItem[] = [
  { label: "Light", icon: "i-lucide-sun", value: "light" },
  { label: "Dark", icon: "i-lucide-moon", value: "dark" },
  { label: "System", icon: "i-lucide-monitor", value: "system" },
];

const userMenu = computed<DropdownMenuItem[][]>(() => [
  [{ label: user.value?.name ?? "User", type: "label" }],
  [
    {
      label: "Theme",
      icon: "i-lucide-palette",
      children: themeItems.map((item) => ({
        ...item,
        type: "checkbox",
        checked: colorMode.preference === item.value,
        onUpdateChecked() {
          colorMode.preference = item.value as string;
        },
        onSelect(e: Event) {
          e.preventDefault();
        },
      })),
    },
  ],
  [
    {
      label: "Sign out",
      icon: "i-lucide-log-out",
      onSelect: onLogout,
    },
  ],
]);

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
    { label: "Activity logs", icon: "i-lucide-scroll-text", to: "/logs" },
  ],
  [
    { label: "HR", type: "label" },
    { label: "Roles", icon: "i-lucide-shield", to: "/roles" },
    { label: "Members", icon: "i-lucide-users", to: "/members" },
  ],
];
</script>
