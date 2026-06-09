// Dummy auth with a single static credential. NOT for production use.
const VALID_USERNAME = "admin";
const VALID_PASSWORD = "admin123";

export function useAuth() {
  // Cookie so auth survives reloads and is readable during SSR middleware.
  const user = useCookie<string | null>("auth_user", {
    default: () => null,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  const isLoggedIn = computed(() => !!user.value);

  function login(username: string, password: string): boolean {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      user.value = username;
      return true;
    }
    return false;
  }

  function logout() {
    user.value = null;
  }

  return { user, isLoggedIn, login, logout };
}
