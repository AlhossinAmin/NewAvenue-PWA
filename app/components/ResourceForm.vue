<script setup lang="ts">
import type { FormError, FormSubmitEvent } from "@nuxt/ui";
import type { FormField } from "~/constants/forms";

const props = defineProps<{
  fields: FormField[];
  state: Record<string, unknown>;
  submitLabel?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  submit: [state: Record<string, unknown>];
}>();

function validate(state: Record<string, unknown>): FormError[] {
  const errors: FormError[] = [];
  for (const field of props.fields) {
    if (!field.required) continue;
    const value = state[field.key];
    const empty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);
    if (empty)
      errors.push({ name: field.key, message: `${field.label} is required` });
  }
  return errors;
}

function onSubmit(event: FormSubmitEvent<Record<string, unknown>>) {
  emit("submit", event.data);
}
</script>

<template>
  <UForm
    :state="state"
    :validate="validate"
    class="flex flex-col gap-6"
    @submit="onSubmit"
  >
    <div class="flex flex-col gap-4">
      <UFormField
        v-for="field in fields"
        :key="field.key"
        :label="field.label"
        :name="field.key"
        :required="field.required"
      >
        <USwitch
          v-if="field.type === 'switch'"
          v-model="state[field.key] as boolean"
        />
        <UTextarea
          v-else-if="field.type === 'textarea'"
          v-model="state[field.key] as string"
          :placeholder="field.placeholder"
          :rows="3"
          class="w-full"
        />
        <USelect
          v-else-if="field.type === 'select'"
          v-model="state[field.key] as string"
          :items="field.options ?? []"
          :placeholder="field.placeholder ?? 'Select…'"
          class="w-full"
        />
        <UInputTags
          v-else-if="field.type === 'tags'"
          v-model="state[field.key] as string[]"
          :placeholder="field.placeholder"
          class="w-full"
        />
        <UInput
          v-else-if="field.type === 'number'"
          v-model.number="state[field.key] as number"
          type="number"
          :placeholder="field.placeholder"
          class="w-full"
        />
        <UInput
          v-else-if="field.type === 'date'"
          v-model="state[field.key] as string"
          type="date"
          class="w-full"
        />
        <UInput
          v-else
          v-model="state[field.key] as string"
          :type="field.type"
          :placeholder="field.placeholder"
          class="w-full"
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
        :label="submitLabel ?? 'Save'"
        :loading="loading"
        icon="i-lucide-check"
      />
    </div>
  </UForm>
</template>
