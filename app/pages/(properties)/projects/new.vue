<template>
  <FormPage panel-id="projects-new" title="New project" back-to="/projects">
    <PropertiesProjectsForm
      @saved="$router.push('/projects')"
      @cancel="$router.back()"
    />
  </FormPage>
</template>
