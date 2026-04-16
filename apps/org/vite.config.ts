import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: { port: 5173 },
  css: {
    transformer: "lightningcss",
  },
  plugins: [
    tailwindcss(),
    sveltekit(),
    paraglideVitePlugin({ project: "./project.inlang", outdir: "./src/lib/paraglide" }),
  ],
  logLevel: "info",
});
