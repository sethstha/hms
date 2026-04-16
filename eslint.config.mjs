// eslint.config.js (root)
import ts from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import betterTailwind from 'eslint-plugin-better-tailwindcss'

export default [
  // TypeScript rules — all TS files across monorepo
  ...ts.configs.recommended,

  // Svelte rules — all Svelte files
  ...svelte.configs['flat/recommended'],

  // Prettier disables conflicting rules
  prettier,
  ...svelte.configs['flat/prettier'],

  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/.svelte-kit/**',
      '**/build/**',
      '**/dist/**',
      '**/.wrangler/**',
      '**/src/paraglide/**',
    ]
  },

  // All TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: { ...globals.node }
    }
  },

  // All Svelte files
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser
      },
      globals: {
        ...globals.browser
      }
    }
  },

  // Shared API library — Node environment only
  {
    files: ['packages/api/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node }
    }
  },

  // Hono API Worker app — Node/Workers environment
  {
    files: ['apps/api/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.serviceworker
      }
    }
  },

  // Better Tailwind — admin app
  {
    files: ['apps/admin/**/*.svelte', 'apps/admin/**/*.ts'],
    plugins: { 'better-tailwindcss': betterTailwind },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'apps/admin/src/routes/layout.css',
      },
    },
    rules: { ...betterTailwind.configs['recommended'].rules },
  },

  // Better Tailwind — orgs app
  {
    files: ['apps/org/**/*.svelte', 'apps/org/**/*.ts'],
    plugins: { 'better-tailwindcss': betterTailwind },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'apps/org/src/app.css',
      },
    },
    rules: { ...betterTailwind.configs['recommended'].rules },
  },

  // Better Tailwind — shared packages (no app-specific entry, use admin as reference)
  {
    files: ['packages/ui/**/*.svelte', 'packages/ui/**/*.ts'],
    plugins: { 'better-tailwindcss': betterTailwind },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'apps/admin/src/routes/layout.css',
      },
    },
    rules: { ...betterTailwind.configs['recommended'].rules },
  },

  // Custom rules
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'error',
      'svelte/no-unused-svelte-ignore': 'warn',
      // goto() in onclick handlers has no resolve() context — only enforce for links/pushState
      'svelte/no-navigation-without-resolve': ['error', { ignoreGoto: true }],
    }
  }
]
