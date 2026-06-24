<template>
  <UForm
    class="flex flex-col gap-6"
    :schema="schema"
    :state="state"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <UFormField label="Name" name="name" required>
        <UInput
          v-model="state.name"
          class="w-full"
          placeholder="Developer name"
        />
      </UFormField>

      <UFormField label="Country" name="country" required>
        <UInput v-model="state.country" class="w-full" placeholder="Country" />
      </UFormField>

      <UFormField label="Agreement" name="agreement">
        <USelect
          v-model="state.agreement"
          class="w-full"
          placeholder="Select…"
          :items="AGREEMENT_OPTIONS"
        />
      </UFormField>

      <UFormField label="Agreement end date" name="agreement_end_date">
        <UInput v-model="state.agreement_end_date" type="date" class="w-full" />
      </UFormField>

      <UFormField label="Projects count" name="projects_count">
        <UInput
          v-model.number="state.projects_count"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Number of deals" name="num_deals">
        <UInput v-model.number="state.num_deals" type="number" class="w-full" />
      </UFormField>

      <UFormField label="Default commission (%)" name="default_commission">
        <UInput
          v-model.number="state.default_commission"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Commission min (%)" name="commission_min">
        <UInput
          v-model.number="state.commission_min"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Commission max (%)" name="commission_max">
        <UInput
          v-model.number="state.commission_max"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Logo" name="logo" class="sm:col-span-2">
        <PhotoInput v-model="state.logo" label="Logo" />
      </UFormField>

      <UFormField label="Description" name="description" class="sm:col-span-2">
        <UTextarea
          v-model="state.description"
          class="w-full"
          placeholder="Short description"
          :rows="3"
        />
      </UFormField>
    </div>

    <div class="flex items-center justify-end gap-2">
      <UButton
        label="Cancel"
        color="neutral"
        variant="ghost"
        @click="emit('cancel')"
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
import * as z from "zod";
import type { DeveloperInput } from "~/composables/properties/useDevelopers";
import type { AgreementStatus, Developer } from "~/types/properties/developers";
import type { MediaItem } from "~/types/common/media";

const props = defineProps<{
  // Omit (or null) to create; pass a developer to edit it.
  record?: Developer | null;
}>();

// Parent owns navigation (saved/cancel) so a detail page can toggle back to its
// read-only view in place. See contacts/Form.vue.
const emit = defineEmits<{ saved: []; cancel: [] }>();

const toast = useToast();
const { createDeveloper, updateDeveloper } = useDevelopers();

const AGREEMENT_OPTIONS: AgreementStatus[] = ["Signed", "Pending", "Expired"];

// Empty number inputs arrive as "" (Vue can't coerce a blank to a number) —
// treat that as "not provided" so optional numeric fields don't fail validation.
const optionalNumber = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? undefined : v),
  z.number().optional(),
);

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  country: z.string().min(1, "Country is required"),
  agreement: z.enum(["Signed", "Pending", "Expired"]).optional(),
  agreement_end_date: z.string().optional(),
  projects_count: optionalNumber,
  num_deals: optionalNumber,
  default_commission: optionalNumber,
  commission_min: optionalNumber,
  commission_max: optionalNumber,
  description: z.string().optional(),
});

// `logo` holds either the existing URL (from a read), a freshly uploaded
// MediaItem, or null — see PhotoInput. It's reshaped to a media id on submit, so
// it lives on state but stays out of the validation schema.
const state = reactive<{
  name: string;
  country: string;
  agreement?: AgreementStatus;
  agreement_end_date: string;
  projects_count?: number;
  num_deals?: number;
  default_commission?: number;
  commission_min?: number;
  commission_max?: number;
  description: string;
  logo: MediaItem | string | null;
}>(
  props.record
    ? { ...props.record }
    : {
        name: "",
        country: "",
        agreement: undefined,
        agreement_end_date: "",
        projects_count: undefined,
        num_deals: undefined,
        default_commission: undefined,
        commission_min: undefined,
        commission_max: undefined,
        description: "",
        logo: null,
      },
);
const loading = ref(false);

const submitLabel = computed(() =>
  props.record ? "Save changes" : "Create developer",
);

const onSubmit = async () => {
  loading.value = true;
  // `logo` is either the existing URL (unchanged → omit so it's left as-is), a
  // freshly uploaded { id, url } (→ send its id), or null (→ send null to
  // clear). The API can't take a URL back: writes are media ids only.
  const payload: Record<string, unknown> = { ...state };
  const logo = state.logo;
  if (logo && typeof logo === "object" && "id" in logo) {
    payload.logo = logo.id;
  } else if (logo === null) {
    payload.logo = null;
  } else {
    delete payload.logo;
  }
  try {
    if (props.record) {
      await updateDeveloper(
        props.record.id,
        payload as Partial<DeveloperInput>,
      );
      toast.add({ title: "Developer updated", color: "success" });
    } else {
      await createDeveloper(payload as DeveloperInput);
      toast.add({ title: "Developer created", color: "success" });
    }
    emit("saved");
  } catch {
    toast.add({
      title: props.record
        ? "Failed to update developer"
        : "Failed to create developer",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};
</script>
