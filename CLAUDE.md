# Code Standards

## File & Folder Naming Conventions

All files and folders use **kebab-case** — lowercase words separated by hyphens (e.g., `my-component-name`).

### Exceptions

| Type                          | Convention                     | Example                                                                                 |
| ----------------------------- | ------------------------------ | --------------------------------------------------------------------------------------- |
| Vue components                | PascalCase                     | `UserProfile.vue`, `AppHeader.vue`                                                      |
| Composables                   | camelCase, prefixed with `use` | `useAuthState.ts`, `useFetchData.ts`                                                    |
| Index files                   | lowercase                      | `index.ts`, `index.vue`                                                                 |
| Third-party configs & tooling | Defined by the tool            | `CLAUDE.md`, `README.md`, `tsconfig.json`, `package-lock.json`, `.vscode/settings.json` |

### Quick Reference

| Case       | Format         | Used For                            |
| ---------- | -------------- | ----------------------------------- |
| kebab-case | `my-file-name` | Default — all files & folders       |
| PascalCase | `MyFileName`   | `.vue` components                   |
| camelCase  | `myFileName`   | Composables (`use` prefix required) |

> **Note on composables:** The filename must match the exported function name.
> e.g., `useFormValidation.ts` exports `function useFormValidation() { ... }`

---

## Variable Naming Conventions

All variables, state, props, events, and functions use **camelCase** by default.

### Exceptions

| Type                      | Convention       | Example                       |
| ------------------------- | ---------------- | ----------------------------- |
| Classes & constructors    | PascalCase       | `UserService`, `ApiClient`    |
| Object properties         | snake_case       | `user_id`, `created_at`       |
| Constants & env variables | UPPER_SNAKE_CASE | `MAX_RETRIES`, `VITE_API_URL` |

### Quick Reference

| Case             | Format                 | Used For                                   |
| ---------------- | ---------------------- | ------------------------------------------ |
| camelCase        | `myVariable`           | Variables, state, props, events, functions |
| PascalCase       | `MyClass`              | Classes and constructors                   |
| snake_case       | `{ my_property: ... }` | Object properties                          |
| UPPER_SNAKE_CASE | `MY_CONSTANT`          | Constants and env variables                |

---

## Vue File (SFC) Organization

While many file types (e.g., `.ts`, `.json`, utilities) follow project-wide conventions with limited flexibility, **Vue SFCs** are the primary files where you can move blocks around freely.

**Recommended Order Inside `.vue` Files**

1. **`<template>`** — The component's HTML structure.
2. **`<script setup>`** _(or `<script>`)_ — Organized in the following sequence:
   - Imports (external libraries, composables, types)
   - `defineProps`
   - `defineEmits`
   - Refs & Reactive State (`ref`, `reactive`, `computed` state)
   - Computed Properties
   - Watchers (`watch`, `watchEffect`)
   - Lifecycle Hooks (in execution order: `onMounted`, `onUpdated`, `onUnmounted`, etc.)
   - Helper/Utility Functions
3. **`<style>`** — Prefer `scoped` unless global theming is required.

---

## Template Rules

**No function calls in templates.** Templates must only reference reactive state, computed properties, or pre-computed object properties — never invoke a function (e.g. `{{ formatTarget(item) }}` or `:prop="compute(x)"`).

Instead:

- For derived values, use a `computed`.
- For per-item display values in a list/table, pre-derive them when shaping the data (map the source array into display-ready objects) so the template only reads properties.

This keeps templates declarative and avoids re-running functions on every re-render.

```vue
<!-- ❌ Bad: function call in template -->
<span>{{ formatTarget(m.target) }}</span>

<!-- ✅ Good: pre-derived property -->
<span>{{ m.target_label }}</span>
```
