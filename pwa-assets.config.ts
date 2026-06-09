import {
  createAppleSplashScreens,
  defineConfig,
} from "@vite-pwa/assets-generator/config";

// The source logo (public/logo.png) is the dark/inverted brand mark, placed on
// a solid white background to match the app's white theme.
const background = "#ffffff";

export default defineConfig({
  headLinkOptions: {
    preset: "2023",
  },
  preset: {
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[48, "favicon.ico"]],
      padding: 0.1,
      resizeOptions: { background, fit: "contain" },
    },
    maskable: {
      sizes: [512],
      padding: 0.3,
      resizeOptions: { background, fit: "contain" },
    },
    apple: {
      sizes: [180],
      padding: 0.3,
      resizeOptions: { background, fit: "contain" },
    },
    appleSplashScreens: createAppleSplashScreens({
      padding: 0.3,
      resizeOptions: { background, fit: "contain" },
      linkMediaOptions: {
        log: true,
        addMediaScreen: true,
      },
      png: {
        compressionLevel: 9,
        quality: 60,
      },
      name: (landscape, size, dark) => {
        return `apple-splash-${landscape ? "landscape" : "portrait"}-${
          typeof dark === "boolean" ? (dark ? "dark-" : "light-") : ""
        }${size.width}x${size.height}.png`;
      },
    }),
  },
  images: ["public/logo.png"],
});
