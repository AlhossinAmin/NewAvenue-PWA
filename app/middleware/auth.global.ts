// Global guard: redirect unauthenticated users to /login, and keep
// authenticated users away from /login.
export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useUser();

  if (!isLoggedIn.value && to.path !== "/login") {
    return navigateTo("/login");
  }

  if (isLoggedIn.value && to.path === "/login") {
    return navigateTo("/");
  }
});
