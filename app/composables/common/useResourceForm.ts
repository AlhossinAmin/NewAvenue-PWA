import type { FormError } from "@nuxt/ui";
import type { FormField, PhoneNumber } from "~/constants/common/forms";

// Shared form behaviour — the logic that used to live inside <ResourceForm>:
// conditional field visibility, clearing hidden fields, keeping computed fields
// in sync, and required-field validation. Each feature form owns its own
// <UForm> markup and wires `validate` + `visibleFields` from here.
export function useResourceForm(
  fields: FormField[],
  state: Record<string, unknown>,
) {
  const isVisible = (field: FormField): boolean => {
    if (!field.visibleWhen) return true;
    const current = state[field.visibleWhen.field];
    // String() so boolean toggles (e.g. a switch) match via in: ["true"].
    return field.visibleWhen.in.includes(String(current));
  };

  const visibleFields = computed(() => fields.filter(isVisible));

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
    () => fields.map(isVisible),
    () => {
      for (const field of fields) {
        if (!isVisible(field)) state[field.key] = emptyValue(field);
      }
    },
    { immediate: true },
  );

  // Keep computed fields (e.g. the derived unit code) in sync with their inputs.
  watchEffect(() => {
    for (const field of fields) {
      if (field.type === "computed" && field.compute)
        state[field.key] = field.compute(state);
    }
  });

  const validate = (data: Record<string, unknown>): FormError[] => {
    const errors: FormError[] = [];
    for (const field of fields) {
      if (!field.required || !isVisible(field)) continue;
      const value = data[field.key];
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

  return { visibleFields, validate, isVisible, emptyValue };
}
