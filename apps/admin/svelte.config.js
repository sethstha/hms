import { relative, sep } from "node:path";
import adapter from "@sveltejs/adapter-cloudflare";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    runes: ({ filename }) => {
      const relativePath = relative(import.meta.dirname, filename);
      const pathSegments = relativePath.toLowerCase().split(sep);
      const isExternalLibrary = pathSegments.includes("node_modules");

      return isExternalLibrary ? undefined : true;
    },
  },
  kit: {
    adapter: adapter(),
    alias: {
      "@hms/ui/theme.css": "../../packages/ui/src/theme.css",
      "@hms/ui": "../../packages/ui/src/index.ts",
      "@hms/utils": "../../packages/utils/src/index.ts",
    },
  },
};

export default config;
