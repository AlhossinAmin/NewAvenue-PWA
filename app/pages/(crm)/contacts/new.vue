<template>
  <FormPage panel-id="contacts-new" title="New contact" back-to="/contacts">
    <CrmContactsForm
      @saved="$router.push('/contacts')"
      @cancel="$router.back()"
    />
  </FormPage>
</template>
