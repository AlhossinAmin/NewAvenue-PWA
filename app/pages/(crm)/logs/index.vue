<template>
  <UDashboardPanel id="logs">
    <template #header>
      <UDashboardNavbar title="Activity logs" icon="i-lucide-scroll-text">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UColorModeButton />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <CrmLogsTable />
    </template>
  </UDashboardPanel>
</template>
