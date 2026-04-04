import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      "@hms/ui": "../../packages/ui/src/index.ts",
      "@hms/types": "../../packages/types/src/index.ts",
      "@hms/utils": "../../packages/utils/src/index.ts",
      "@hms/db": "../../packages/db/src/index.ts",
    },
  },
};

export default config;
