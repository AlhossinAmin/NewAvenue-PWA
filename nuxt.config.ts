// https://nuxt.com/docs/api/configuration/nuxt-config
// Enable the PWA everywhere except local development.
const isDev = process.env.NODE_ENV === "development";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@vite-pwa/nuxt"],
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      // Icon and Apple splash-screen <link> tags are injected by
      // <NuxtPwaAssets /> from pwa-assets.config.ts — keep only the metas here.
      meta: [
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
        { name: "apple-mobile-web-app-title", content: "Avenu" },
        { name: "theme-color", content: "#ffffff" },
      ],
    },
  },
  pwa: {
    // Run the service worker everywhere except local development.
    disable: isDev,
    registerType: "autoUpdate",
    // Generate icons + Apple splash screens from pwa-assets.config.ts and
    // inject their <link> tags via <NuxtPwaAssets />.
    pwaAssets: {
      config: true,
    },
    manifest: {
      name: "Avenu",
      short_name: "Avenu",
      description: "Avenu PWA",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
      orientation: "portrait",
      start_url: "/",
      icons: [
        {
          src: "pwa-64x64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "maskable-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico,woff,woff2}"],
    },
    client: {
      registerPlugin: true,
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true,
      navigateFallback: "/",
      type: "module",
    },
  },
});
