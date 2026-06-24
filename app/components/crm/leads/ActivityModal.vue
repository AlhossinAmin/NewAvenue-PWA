<template>
  <UModal v-model:open="open" title="Log activity">
    <template #body>
      <UForm
        class="flex flex-col gap-4"
        :state="state"
        :validate="validate"
        @submit="onSubmit"
      >
        <UFormField label="Logged by" name="logged_by" required>
          <AgentSelect v-model="state.logged_by" placeholder="Select agent…" />
        </UFormField>

        <UFormField label="New status" name="status" required>
          <USelect
            v-model="state.status"
            class="w-full"
            placeholder="Select status…"
            :items="LEAD_STATES"
          />
        </UFormField>

        <UFormField label="Activity date & time" name="activity_at" required>
          <UInput
            v-model="state.activity_at"
            type="datetime-local"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Next action date" name="next_action_date" required>
          <UInput v-model="state.next_action_date" type="date" class="w-full" />
        </UFormField>

        <UFormField label="Notes" name="notes" required>
          <UTextarea
            v-model="state.notes"
            class="w-full"
            placeholder="Add notes…"
            :rows="3"
          />
        </UFormField>

        <div class="flex items-center justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="open = false"
          />
          <UButton
            type="submit"
            icon="i-lucide-check"
            label="Log activity"
            :loading="loading"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { FormError, FormSubmitEvent } from "@nuxt/ui";
import type { LeadState, LeadActivityInput } from "~/types/crm/leads";

const props = defineProps<{
  leadId: string | null;
}>();

const emit = defineEmits<{ logged: [] }>();

const open = defineModel<boolean>("open", { default: false });

const toast = useToast();
const { createLeadActivity } = useLeadActivities();

const LEAD_STATES: LeadState[] = [
  "Unreachable",
  "Following",
  "Meeting",
  "Showing",
  "Postponed",
  "Not Interested",
  "Done Deal",
  "Seller",
  "Broker",
  "Old Data",
];

const emptyState = () => ({
  logged_by: "",
  status: "Unreachable" as LeadState,
  activity_at: "",
  next_action_date: "",
  notes: "",
});

const state = reactive(emptyState());
const loading = ref(false);

// Reset form each time the modal opens.
watch(open, (isOpen) => {
  if (isOpen) Object.assign(state, emptyState());
});

const validate = (data: typeof state): FormError[] => {
  const errors: FormError[] = [];
  if (!data.logged_by)
    errors.push({ name: "logged_by", message: "Logged by is required" });
  if (!data.status)
    errors.push({ name: "status", message: "Status is required" });
  if (!data.activity_at)
    errors.push({
      name: "activity_at",
      message: "Activity date & time is required",
    });
  if (!data.next_action_date)
    errors.push({
      name: "next_action_date",
      message: "Next action date is required",
    });
  if (!data.notes)
    errors.push({ name: "notes", message: "Notes are required" });
  return errors;
};

const onSubmit = async (event: FormSubmitEvent<typeof state>) => {
  if (!props.leadId) return;
  loading.value = true;
  try {
    const { logged_by, status, activity_at, next_action_date, notes } =
      event.data;
    const payload: LeadActivityInput = {
      logged_by,
      status: status as LeadState,
      // datetime-local gives "YYYY-MM-DDTHH:MM"; append seconds for ISO 8601.
      activity_at:
        activity_at.length === 16 ? `${activity_at}:00` : activity_at,
      next_action_date,
      notes,
    };
    await createLeadActivity(props.leadId, payload);
    toast.add({ title: "Activity logged", color: "success" });
    open.value = false;
    emit("logged");
  } catch {
    toast.add({ title: "Failed to log activity", color: "error" });
  } finally {
    loading.value = false;
  }
};
</script>
