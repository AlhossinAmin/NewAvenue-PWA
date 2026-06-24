export function useApi() {
  const config = useRuntimeConfig();
  const token = useCookie<string | null>("auth_token");
  const user = useState<unknown | null>("auth_user");

  return $fetch.create({
    baseURL: `${config.public.baseUrl}/api/v1`,
    onRequest: ({ options }) => {
      const headers = new Headers(options.headers);
      headers.set("Accept", "application/json");
      if (token.value) headers.set("Authorization", `Bearer ${token.value}`);
      options.headers = headers;
    },
    onResponseError: async ({ request, response }) => {
      const isAuthError = response.status === 401;
      const isLoginRequest = String(request).includes("/login");

      // A 401 on /login is just bad credentials, not an expired session.
      if (!isAuthError || isLoginRequest) return;

      // Only act if the user was considered logged in.
      if (!token.value) return;

      token.value = null;
      user.value = null;

      if (import.meta.client) await navigateTo("/login");
    },
  });
}
