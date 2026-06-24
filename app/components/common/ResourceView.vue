<template>
  <dl class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
    <div
      v-for="row in rows"
      class="flex flex-col gap-1"
      :key="row.key"
      :class="{ 'sm:col-span-2': row.full }"
    >
      <dt class="text-xs font-medium text-muted">{{ row.label }}</dt>

      <dd v-if="row.kind === 'image'">
        <img
          v-if="row.image"
          class="size-20 rounded-lg object-cover"
          :src="row.image"
          :alt="row.label"
        />
        <span v-else class="text-sm text-dimmed">—</span>
      </dd>

      <dd v-else-if="row.kind === 'images'" class="flex flex-wrap gap-2">
        <img
          v-for="(src, i) in row.images"
          class="size-20 rounded-lg object-cover"
          :key="i"
          :src="src"
          :alt="`${row.label} ${i + 1}`"
        />
        <span v-if="!row.images.length" class="text-sm text-dimmed">—</span>
      </dd>

      <dd v-else class="text-sm text-highlighted">{{ row.value }}</dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import type { FormField, PhoneNumber } from "~/constants/common/forms";
import type { MediaItem } from "~/types/common/media";

const props = defineProps<{
  fields: FormField[];
  // Any entity record. Typed as `object` (not `Record<string, unknown>`) so the
  // concrete interfaces (Contact, Lead, …) assign without an index signature;
  // `rec` casts it once for keyed access.
  record: object;
}>();

const EMPTY = "—";

const rec = computed(() => props.record as Record<string, unknown>);

// Resolve a relational value (contact/agent/project/developer) that the API
// returns as a nested { id, name } object on reads, or as a bare string.
const relationLabel = (value: unknown): string => {
  if (value == null || value === "") return EMPTY;
  if (typeof value === "object" && "name" in (value as Record<string, unknown>))
    return String((value as { name: unknown }).name);
  return String(value);
};

// Resolve a media value (photo/image) to its URL — it may be a bare URL string
// or a { url } object (MediaItem).
const mediaUrl = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "url" in (value as Record<string, unknown>))
    return String((value as MediaItem).url ?? "");
  return "";
};

const isVisible = (field: FormField): boolean => {
  if (!field.visibleWhen) return true;
  const current = rec.value[field.visibleWhen.field];
  return field.visibleWhen.in.includes(String(current));
};

// Pre-derive a display-ready row per visible field so the template only reads
// properties (no function calls / formatting in markup).
const rows = computed(() =>
  props.fields.filter(isVisible).map((field) => {
    const value = rec.value[field.key];
    const base = { key: field.key, label: field.label, full: field.full };

    switch (field.type) {
      case "image":
      case "photo":
        return { ...base, kind: "image" as const, image: mediaUrl(value) };

      case "images":
      case "photos": {
        const list = Array.isArray(value) ? value : [];
        return {
          ...base,
          kind: "images" as const,
          images: list.map(mediaUrl).filter(Boolean),
        };
      }

      case "phones": {
        const phones = Array.isArray(value) ? (value as PhoneNumber[]) : [];
        const text = phones
          .filter((p) => p.number?.trim())
          .map((p) => `${p.country_code} ${p.number}`)
          .join(", ");
        return { ...base, kind: "text" as const, value: text || EMPTY };
      }

      case "switch":
        return { ...base, kind: "text" as const, value: value ? "Yes" : "No" };

      case "contact":
      case "agent":
      case "project":
      case "developer":
      case "role":
        return { ...base, kind: "text" as const, value: relationLabel(value) };

      case "multiselect":
      case "tags": {
        const list = Array.isArray(value) ? value : [];
        return {
          ...base,
          kind: "text" as const,
          value: list.length ? list.join(", ") : EMPTY,
        };
      }

      default: {
        const text = value == null || value === "" ? EMPTY : String(value);
        return { ...base, kind: "text" as const, value: text };
      }
    }
  }),
);
</script>
