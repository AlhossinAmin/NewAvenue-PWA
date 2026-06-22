<template>
  <div class="flex min-h-dvh items-center justify-center bg-muted p-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="flex flex-col items-center gap-3 text-center">
          <img
            alt="Avenu"
            class="h-10 w-auto invert dark:invert-0"
            :src="logo"
          />
          <h1 class="text-xl font-bold">Sign in</h1>
          <p class="text-sm text-muted">Use admin / admin123</p>
        </div>
      </template>

      <UForm
        class="flex flex-col gap-4"
        :schema="schema"
        :state="state"
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

<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import logo from "~/assets/white-logo.svg";

definePageMeta({ layout: false });

const { login } = useUser();
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

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true;
  try {
    const member = await login(event.data.username, event.data.password);
    toast.add({
      title: `Welcome back, ${member.name}`,
      color: "success",
    });
    await navigateTo("/");
  } catch (error) {
    toast.add({
      title: "Sign in failed",
      description: getApiErrorMessage(error, "Invalid credentials"),
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};
</script>
