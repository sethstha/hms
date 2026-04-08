import { defineConfig } from "jsrepo";

export default defineConfig({
  registries: ["@ieedan/shadcn-svelte-extras"],
  paths: {
    ui: "@hms/ui/componentsui",
    component: "@hms/ui/components",
    hook: "@hms/utils",
    action: "$lib/actions",
    util: "@hms/utils",
    lib: "$lib",
  },
});
