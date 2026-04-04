import { relative, sep } from "node:path";
import adapter from "@sveltejs/adapter-static";

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
      "@hms/types": "../../packages/types/src/index.ts",
      "@hms/ui/theme.css": "../../packages/ui/src/lib/theme.css",
      "@hms/ui": "../../packages/ui/src/index.ts",
      "@hms/utils": "../../packages/utils/src/index.ts",
    },
  },
};

export default config;
