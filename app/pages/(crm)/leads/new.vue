<template>
  <FormPage panel-id="leads-new" title="New lead" back-to="/leads">
    <CrmLeadsForm @saved="$router.push('/leads')" @cancel="$router.back()" />
  </FormPage>
</template>
