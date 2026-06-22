export function useApi() {
  const config = useRuntimeConfig();
  const token = useCookie<string | null>("auth_token");

  return $fetch.create({
    baseURL: `${config.public.baseUrl}/api/v1`,
    onRequest: ({ options }) => {
      const headers = new Headers(options.headers);
      headers.set("Accept", "application/json");
      if (token.value) headers.set("Authorization", `Bearer ${token.value}`);
      options.headers = headers;
    },
  });
}
