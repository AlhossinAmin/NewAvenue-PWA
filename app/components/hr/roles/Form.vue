<template>
  <UForm
    class="flex flex-col gap-6"
    :state="state"
    :validate="validate"
    @submit="onSubmit"
  >
    <div class="flex flex-col gap-4">
      <UFormField
        v-for="field in visibleFields"
        :key="field.key"
        :label="field.label"
        :name="field.key"
        :required="field.required"
      >
        <HrRolesSelect
          v-if="field.type === 'role'"
          v-model="state[field.key] as string"
          by="id"
          :placeholder="field.placeholder"
        />
        <USelect
          v-else-if="field.type === 'select'"
          v-model="state[field.key] as string"
          class="w-full"
          :items="field.options ?? []"
          :placeholder="field.placeholder ?? 'Select…'"
        />
        <USwitch
          v-else-if="field.type === 'switch'"
          v-model="state[field.key] as boolean"
        />
        <UInput
          v-else
          v-model="state[field.key] as string"
          class="w-full"
          :type="field.type"
          :placeholder="field.placeholder"
        />
      </UFormField>
    </div>

    <div class="flex items-center justify-end gap-2">
      <UButton
        label="Cancel"
        color="neutral"
        variant="ghost"
        @click="$router.back()"
      />
      <UButton
        type="submit"
        icon="i-lucide-check"
        :label="submitLabel"
        :loading="loading"
      />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { ROLE_FIELDS, createEmptyState } from "~/constants/common/forms";
import type { RoleInput } from "~/composables/hr/useRoles";
import type { Role } from "~/types/hr/roles";

const props = defineProps<{
  // Omit (or null) to create; pass a role to edit it.
  record?: Role | null;
}>();

const toast = useToast();
const { createRole, updateRole } = useRoles();

const state = reactive<Record<string, unknown>>(
  props.record ? { ...props.record } : createEmptyState(ROLE_FIELDS),
);
const loading = ref(false);

const { visibleFields, validate } = useResourceForm(ROLE_FIELDS, state);

const submitLabel = computed(() =>
  props.record ? "Save changes" : "Create role",
);

const onSubmit = async (event: FormSubmitEvent<Record<string, unknown>>) => {
  // Unset tier/parent come through as "" — send null so they clear the value
  // instead of failing the enum / `exists` validation.
  const payload = {
    ...event.data,
    tier: event.data.tier || null,
    parent_role: event.data.parent_role || null,
  };

  loading.value = true;
  try {
    if (props.record) {
      await updateRole(props.record.id, payload as Partial<RoleInput>);
      toast.add({ title: "Role updated", color: "success" });
    } else {
      await createRole(payload as RoleInput);
      toast.add({ title: "Role created", color: "success" });
    }
    navigateTo("/roles");
  } catch {
    toast.add({
      title: props.record ? "Failed to update role" : "Failed to create role",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};
</script>
