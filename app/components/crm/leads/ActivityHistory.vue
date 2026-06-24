<template>
  <div class="flex flex-col gap-4">
    <div
      v-if="status === 'pending' && !activities.length"
      class="flex flex-col gap-3"
    >
      <USkeleton v-for="i in 3" class="h-16 w-full rounded-lg" :key="i" />
    </div>

    <p v-else-if="!activities.length" class="text-sm text-muted">
      No activities logged yet.
    </p>

    <ol v-else class="flex flex-col gap-3">
      <li
        v-for="entry in activities"
        class="flex flex-col gap-1 rounded-lg border border-default bg-elevated px-4 py-3"
        :key="entry.id"
      >
        <div class="flex items-center gap-2">
          <UBadge variant="subtle" :color="STATE_COLOR[entry.status]">
            {{ entry.status }}
          </UBadge>
          <span class="text-sm font-medium">{{ entry.activity_at_label }}</span>
        </div>
        <p v-if="entry.notes" class="text-sm text-highlighted">
          {{ entry.notes }}
        </p>
        <p class="text-xs text-muted">
          {{ entry.logged_by.name }}
          <span class="text-dimmed">
            · logged {{ entry.created_at_label }}</span
          >
        </p>
      </li>
    </ol>

    <UButton
      v-if="hasMore"
      label="Load more"
      color="neutral"
      variant="outline"
      :loading="status === 'pending'"
      @click="loadMore"
    />
  </div>
</template>

<script setup lang="ts">
import type { LeadActivity, LeadState } from "~/types/crm/leads";

const props = defineProps<{
  leadId: string;
}>();

const STATE_COLOR: Record<
  LeadState,
  "info" | "neutral" | "warning" | "error" | "success" | "primary"
> = {
  Unreachable: "neutral",
  Following: "info",
  Meeting: "primary",
  Showing: "primary",
  Postponed: "warning",
  "Not Interested": "neutral",
  "Done Deal": "success",
  Seller: "warning",
  Broker: "warning",
  "Old Data": "neutral",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dateOnlyFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
});

type ActivityRow = LeadActivity & {
  activity_at_label: string;
  created_at_label: string;
};

const { fetchLeadActivities } = useLeadActivities();

const page = ref(1);
const hasMore = ref(false);
const status = ref<"idle" | "pending" | "error">("idle");
const rawActivities = ref<LeadActivity[]>([]);

const activities = computed<ActivityRow[]>(() =>
  rawActivities.value.map((a) => ({
    ...a,
    activity_at_label: dateFormatter.format(new Date(a.activity_at)),
    created_at_label: dateOnlyFormatter.format(new Date(a.created_at)),
  })),
);

const fetchPage = async (reset = false) => {
  status.value = "pending";
  try {
    const targetPage = reset ? 1 : page.value;
    const res = await fetchLeadActivities(props.leadId, {
      page: targetPage,
      per_page: 15,
    });
    rawActivities.value = reset
      ? res.data
      : [...rawActivities.value, ...res.data];
    const pagination = Array.isArray(res.pagination) ? null : res.pagination;
    hasMore.value = pagination?.has_more_pages ?? false;
    page.value = targetPage + 1;
  } catch {
    status.value = "error";
    return;
  }
  status.value = "idle";
};

const loadMore = () => fetchPage();

const refresh = () => {
  page.value = 1;
  fetchPage(true);
};

defineExpose({ refresh });

onMounted(() => fetchPage(true));
</script>
