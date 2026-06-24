<template>
  <FormPage panel-id="members-new" title="New member" back-to="/members">
    <HrMembersForm @saved="$router.push('/members')" @cancel="$router.back()" />
  </FormPage>
</template>
