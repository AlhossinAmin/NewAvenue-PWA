<template>
  <FormPage
    panel-id="developers-new"
    title="New developer"
    back-to="/developers"
  >
    <PropertiesDevelopersForm
      @saved="$router.push('/developers')"
      @cancel="$router.back()"
    />
  </FormPage>
</template>
