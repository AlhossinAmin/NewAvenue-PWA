<template>
  <div class="flex flex-col gap-2">
    <!-- One row per phone: country-code dropdown + number, with a remove button
         once there's more than one. An "Add" button appends another row. -->
    <div
      v-for="(phone, index) in phones"
      :key="index"
      class="flex items-center gap-2"
    >
      <USelect
        v-model="phone.country_code"
        :items="COUNTRY_CODE_OPTIONS"
        class="w-28 shrink-0"
      />
      <UInput
        v-model="phone.number"
        type="tel"
        :placeholder="placeholder ?? 'Mobile number'"
        class="flex-1"
      />
      <UButton
        v-if="phones.length > 1"
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        square
        aria-label="Remove phone"
        @click="removeAt(index)"
      />
    </div>

    <UButton
      label="Add phone"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      size="sm"
      class="self-start"
      @click="addPhone"
    />
  </div>
</template>

<script setup lang="ts">
import {
  COUNTRY_CODE_OPTIONS,
  DEFAULT_COUNTRY_CODE,
  type PhoneNumber,
} from "~/constants/forms";

defineProps<{
  placeholder?: string;
}>();

const model = defineModel<PhoneNumber[]>({ default: () => [] });

// Always render at least one row so the field is never empty on screen.
const phones = computed(() =>
  model.value?.length
    ? model.value
    : [{ country_code: DEFAULT_COUNTRY_CODE, number: "" }],
);

const addPhone = () => {
  model.value = [
    ...phones.value,
    { country_code: DEFAULT_COUNTRY_CODE, number: "" },
  ];
};

const removeAt = (index: number) => {
  model.value = phones.value.filter((_, i) => i !== index);
};
</script>
