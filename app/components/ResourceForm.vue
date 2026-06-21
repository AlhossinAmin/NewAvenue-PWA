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
        <ContactSelect
          v-if="field.type === 'contact'"
          v-model="state[field.key] as string"
          :placeholder="field.placeholder"
        />
        <ProjectSelect
          v-else-if="field.type === 'project'"
          v-model="state[field.key] as string"
          :placeholder="field.placeholder"
        />
        <DeveloperSelect
          v-else-if="field.type === 'developer'"
          v-model="state[field.key] as string"
          :placeholder="field.placeholder"
        />
        <ImageInput
          v-else-if="field.type === 'image'"
          v-model="state[field.key] as string"
          :label="field.label"
          :placeholder="field.placeholder"
        />
        <ImagesInput
          v-else-if="field.type === 'images'"
          v-model="state[field.key] as string[]"
          :label="field.label"
          :placeholder="field.placeholder"
        />
        <PhonesInput
          v-else-if="field.type === 'phones'"
          v-model="state[field.key] as PhoneNumber[]"
          :placeholder="field.placeholder"
        />
        <USwitch
          v-else-if="field.type === 'switch'"
          v-model="state[field.key] as boolean"
        />
        <UTextarea
          v-else-if="field.type === 'textarea'"
          v-model="state[field.key] as string"
          class="w-full"
          :placeholder="field.placeholder"
          :rows="3"
        />
        <USelect
          v-else-if="field.type === 'select'"
          v-model="state[field.key] as string"
          class="w-full"
          :items="field.options ?? []"
          :placeholder="field.placeholder ?? 'Select…'"
        />
        <ComboboxInput
          v-else-if="field.type === 'combobox'"
          v-model="state[field.key] as string"
          :options="field.options"
          :placeholder="field.placeholder"
        />
        <USelectMenu
          v-else-if="field.type === 'multiselect'"
          v-model="state[field.key] as string[]"
          multiple
          class="w-full"
          :items="field.options ?? []"
          :placeholder="field.placeholder ?? 'Select…'"
        />
        <UInputTags
          v-else-if="field.type === 'tags'"
          v-model="state[field.key] as string[]"
          class="w-full"
          :placeholder="field.placeholder"
        />
        <UInput
          v-else-if="field.type === 'number'"
          v-model.number="state[field.key] as number"
          type="number"
          class="w-full"
          :placeholder="field.placeholder"
        />
        <UInput
          v-else-if="field.type === 'date'"
          v-model="state[field.key] as string"
          type="date"
          class="w-full"
        />
        <UInput
          v-else-if="field.type === 'computed'"
          readonly
          disabled
          placeholder="Auto-generated"
          class="w-full"
          :model-value="state[field.key] as string"
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
        @click="cancelHandler ? cancelHandler() : $router.back()"
      />
      <UButton
        type="submit"
        icon="i-lucide-check"
        :label="submitLabel ?? 'Save'"
        :loading="loading"
      />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { FormError, FormSubmitEvent } from "@nuxt/ui";
import type { FormField, PhoneNumber } from "~/constants/forms";

const props = defineProps<{
  fields: FormField[];
  state: Record<string, unknown>;
  submitLabel?: string;
  loading?: boolean;
  // When provided, the Cancel button runs this instead of router.back() —
  // lets the form be reused inside a modal/drawer.
  cancelHandler?: () => void;
}>();

const emit = defineEmits<{
  submit: [state: Record<string, unknown>];
}>();

const isVisible = (field: FormField): boolean => {
  if (!field.visibleWhen) return true;
  const current = props.state[field.visibleWhen.field];
  // String() so boolean toggles (e.g. a switch) match via in: ["true"].
  return field.visibleWhen.in.includes(String(current));
};

const visibleFields = computed(() => props.fields.filter(isVisible));

const emptyValue = (field: FormField): unknown => {
  if (field.type === "number") return undefined;
  if (field.type === "switch") return false;
  if (
    field.type === "tags" ||
    field.type === "multiselect" ||
    field.type === "images" ||
    field.type === "phones"
  )
    return [];
  return "";
};

// Clear the value of any field that has become hidden, so mutually-exclusive
// fields (e.g. project vs. seller name) never both carry a value.
watch(
  () => props.fields.map(isVisible),
  () => {
    for (const field of props.fields) {
      if (!isVisible(field)) props.state[field.key] = emptyValue(field);
    }
  },
  { immediate: true },
);

// Keep computed fields (e.g. the derived unit code) in sync with their inputs.
watchEffect(() => {
  for (const field of props.fields) {
    if (field.type === "computed" && field.compute)
      props.state[field.key] = field.compute(props.state);
  }
});

const validate = (state: Record<string, unknown>): FormError[] => {
  const errors: FormError[] = [];
  for (const field of props.fields) {
    if (!field.required || !isVisible(field)) continue;
    const value = state[field.key];
    let empty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);
    // Phones come as rows; require at least one with an actual number typed in.
    if (field.type === "phones")
      empty = !(value as PhoneNumber[]).some((p) => p.number.trim() !== "");
    if (empty)
      errors.push({ name: field.key, message: `${field.label} is required` });
  }
  return errors;
};

const onSubmit = (event: FormSubmitEvent<Record<string, unknown>>) => {
  emit("submit", event.data);
};
</script>
