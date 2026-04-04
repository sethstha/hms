import path from "path";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type PluginOption } from "vite";

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
    }) as unknown as PluginOption,
    tailwindcss(),
    sveltekit(),
  ],
  server: {
    port: 5174,
  },
  build: {
    cssCodeSplit: false,
  },
});
