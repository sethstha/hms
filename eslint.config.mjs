import betterTailwind from "eslint-plugin-better-tailwindcss";
import sveltePlugin from "eslint-plugin-svelte";
import globals from "globals";
import tseslint from "typescript-eslint";

const SVELTE_FILES = [
  "apps/admin/**/*.svelte",
  "apps/hospital/**/*.svelte",
  "packages/ui/**/*.svelte",
];

function tailwindConfig(files, entryPoint) {
  return {
    files,
    plugins: { "better-tailwindcss": betterTailwind },
    settings: { "better-tailwindcss": { entryPoint } },
    rules: { ...betterTailwind.configs["recommended"].rules },
  };
}

export default tseslint.config(
  // ── Global ignores ──────────────────────────────────────────────────────────
  {
    ignores: [
      "**/node_modules/**",
      "coss-main/**",
      "**/.svelte-kit/**",
      "**/.wrangler/**",
      "**/dist/**",
      "**/build/**",
      "**/$houdini/**",
      "**/*.gen.ts",
      "**/codegen.ts",
    ],
  },

  // ── TypeScript base ──────────────────────────────────────────────────────────
  ...tseslint.configs.recommended,

  // ── Tailwind linting ─────────────────────────────────────────────────────────
  tailwindConfig(["apps/web/**/*.svelte", "apps/web/src/**/*.ts"], "apps/web/src/app.css"),
  tailwindConfig(
    ["apps/dashboard/**/*.svelte", "apps/dashboard/src/**/*.ts"],
    "apps/dashboard/src/app.css",
  ),
  tailwindConfig(["packages/ui/**/*.svelte", "packages/**/*.ts"], "apps/web/src/app.css"),

  // ── Svelte files ─────────────────────────────────────────────────────────────
  {
    files: SVELTE_FILES,
    extends: sveltePlugin.configs["flat/recommended"],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
      globals: { ...globals.browser },
    },
    rules: {
      "svelte/no-unused-svelte-ignore": "error",
    },
  },

  // ── All frontend files ────────────────────────────────────────────────────────
  {
    files: [
      ...SVELTE_FILES,
      "apps/web/src/**/*.ts",
      "apps/dashboard/src/**/*.ts",
      "packages/**/*.ts",
    ],
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // ── API — Hono / Cloudflare Workers ──────────────────────────────────────────
  {
    files: ["apps/api/src/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": "warn",
    },
  },
);
