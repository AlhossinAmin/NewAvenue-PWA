// Global guard: redirect unauthenticated users to /login, and keep
// authenticated users away from /login.
export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn.value && to.path !== "/login") {
    return navigateTo("/login");
  }

  if (isLoggedIn.value && to.path === "/login") {
    return navigateTo("/");
  }
});
