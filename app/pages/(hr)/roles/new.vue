<template>
  <FormPage panel-id="roles-new" title="New role" back-to="/roles">
    <HrRolesForm @saved="$router.push('/roles')" @cancel="$router.back()" />
  </FormPage>
</template>
