<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import logo from "~/assets/white-logo.svg";

definePageMeta({ layout: false });

const { login } = useAuth();
const toast = useToast();
const loading = ref(false);

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  username: "",
  password: "",
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  // Simulate a tiny network delay for UX feedback.
  await new Promise((r) => setTimeout(r, 300));

  const ok = login(event.data.username, event.data.password);
  loading.value = false;

  if (ok) {
    toast.add({ title: "Welcome back, admin", color: "success" });
    await navigateTo("/");
  } else {
    toast.add({
      title: "Invalid credentials",
      description: "Use admin / admin123",
      color: "error",
    });
  }
}
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-muted p-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="flex flex-col items-center gap-3 text-center">
          <img :src="logo" alt="Avenu" class="h-10 w-auto invert dark:invert-0" />
          <h1 class="text-xl font-bold">Sign in</h1>
          <p class="text-sm text-muted">Use admin / admin123</p>
        </div>
      </template>

      <UForm
        :schema="schema"
        :state="state"
        class="flex flex-col gap-4"
        @submit="onSubmit"
      >
        <UFormField label="Username" name="username">
          <UInput
            v-model="state.username"
            placeholder="admin"
            icon="i-lucide-user"
            size="lg"
            autocomplete="username"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput
            v-model="state.password"
            type="password"
            placeholder="••••••••"
            icon="i-lucide-lock"
            size="lg"
            autocomplete="current-password"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          label="Sign in"
          size="lg"
          block
          :loading="loading"
        />
      </UForm>
    </UCard>
  </div>
</template>
