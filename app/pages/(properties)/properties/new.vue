<template>
  <FormPage
    panel-id="properties-new"
    title="New property"
    back-to="/properties"
  >
    <PropertiesPropertiesForm
      @saved="$router.push('/properties')"
      @cancel="$router.back()"
    />
  </FormPage>
</template>
