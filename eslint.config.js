// eslint.config.js (root)
import js from '@eslint/js'
import ts from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import svelteParser from 'svelte-eslint-parser'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  // Base JS rules
  js.configs.recommended,

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
      '**/src/paraglide/**',  // auto-generated, never lint this
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
      parser: svelteParser,
      parserOptions: {
        parser: ts.parser
      },
      globals: {
        ...globals.browser
      }
    }
  },

  // Shared API library — Node environment only (no Worker globals)
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

  // Custom rules
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'error',
      'svelte/no-unused-svelte-ignore': 'warn',
    }
  }
]
