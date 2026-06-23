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
          placeholder="Project name"
        />
      </UFormField>

      <UFormField label="Developer" name="developer" required>
        <PropertiesDevelopersSelect v-model="state.developer" />
      </UFormField>

      <UFormField label="Country" name="country">
        <UInput v-model="state.country" class="w-full" placeholder="Country" />
      </UFormField>

      <UFormField label="City" name="city">
        <UInput v-model="state.city" class="w-full" placeholder="City" />
      </UFormField>

      <UFormField label="District" name="district">
        <ComboboxInput v-model="state.district" :options="DISTRICT_OPTIONS" />
      </UFormField>

      <UFormField label="Category" name="category" required>
        <USelectMenu
          v-model="state.category"
          multiple
          class="w-full"
          placeholder="Select…"
          :items="CATEGORY_OPTIONS"
        />
      </UFormField>

      <UFormField label="Commission (%)" name="commission_scheme">
        <UInput
          v-model.number="state.commission_scheme"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Resale units sold" name="resale_units_sold">
        <UInput
          v-model.number="state.resale_units_sold"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Resale units remaining" name="resale_units_remaining">
        <UInput
          v-model.number="state.resale_units_remaining"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Photos" name="photos" class="sm:col-span-2">
        <PhotosInput v-model="state.photos" label="Photos" />
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
import * as z from "zod";
import { DISTRICT_OPTIONS } from "~/constants/common/forms";
import type { ProjectInput } from "~/composables/properties/useProjects";
import type { Project, ProjectCategory } from "~/types/properties/projects";
import type { MediaItem } from "~/types/common/media";

const props = defineProps<{
  // Omit (or null) to create; pass a project to edit it.
  record?: Project | null;
}>();

const toast = useToast();
const { createProject, updateProject } = useProjects();

const CATEGORY_OPTIONS: ProjectCategory[] = [
  "Residential",
  "Administrative",
  "Retail",
  "Commercial",
  "Mixed",
];

// Empty number inputs arrive as "" — treat as "not provided" (see Form.vue notes).
const optionalNumber = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? undefined : v),
  z.number().optional(),
);

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  developer: z.string().min(1, "Developer is required"),
  country: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  category: z.array(z.string()).min(1, "Category is required"),
  commission_scheme: optionalNumber,
  resale_units_sold: optionalNumber,
  resale_units_remaining: optionalNumber,
  description: z.string().optional(),
});

// The API returns `developer` as a { id, name } object, but the form (and the
// update payload) work with the developer's UUID — seed it from `developer.id`.
// `photos` holds { id, url } objects in state; they're reshaped to media ids on
// submit, so they live on state but stay out of the validation schema.
const state = reactive<{
  name: string;
  developer: string;
  country: string;
  city: string;
  district: string;
  category: ProjectCategory[];
  commission_scheme?: number;
  resale_units_sold?: number;
  resale_units_remaining?: number;
  description: string;
  photos: MediaItem[];
}>(
  props.record
    ? {
        ...props.record,
        developer: props.record.developer?.id ?? "",
        photos: props.record.photos ?? [],
      }
    : {
        name: "",
        developer: "",
        country: "",
        city: "",
        district: "",
        category: [],
        commission_scheme: undefined,
        resale_units_sold: undefined,
        resale_units_remaining: undefined,
        description: "",
        photos: [],
      },
);
const loading = ref(false);

const submitLabel = computed(() =>
  props.record ? "Save changes" : "Create project",
);

const onSubmit = async () => {
  loading.value = true;
  // `photos` holds { id, url } objects in state; the API expects media ids.
  const payload = {
    ...state,
    photos: state.photos.map((photo) => photo.id),
  };
  try {
    if (props.record) {
      await updateProject(props.record.id, payload as Partial<ProjectInput>);
      toast.add({ title: "Project updated", color: "success" });
    } else {
      await createProject(payload as ProjectInput);
      toast.add({ title: "Project created", color: "success" });
    }
    navigateTo("/projects");
  } catch {
    toast.add({
      title: props.record
        ? "Failed to update project"
        : "Failed to create project",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};
</script>
