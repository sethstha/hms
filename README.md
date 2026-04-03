## Commands

```bash
# Install dependencies
pnpm install

# Development (interactive selector — choose which services to start)
pnpm dev

# Start individual services
pnpm dev:hospital   # http://localhost:5173
pnpm dev:admin      # http://localhost:5174
pnpm dev:api        # http://localhost:8787

# Build all apps
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Database
pnpm db:generate    # Generate Drizzle migrations from schema changes
pnpm db:migrate     # Apply pending migrations
pnpm db:seed        # Seed initial data
```

## Architecture Overview

This is a **multi-tenant Hospital Management System (HMS)** monorepo.

### Workspace Layout

```
apps/
  hospital/   # SvelteKit app for hospital staff (port 5173)
  admin/      # SvelteKit app for system admins (port 5174)
  api/        # Hono API server, runs on Cloudflare Workers (port 8787)
packages/
  api/        # Shared DB connection, schema, auth setup, types (@hms/api)
  ui/         # Shared Svelte UI components (@hms/ui)
  types/      # Shared TypeScript types & Zod schemas (@hms/types)
  utils/      # Shared utility functions (@hms/utils)
```

### Key Tech Stack

| Layer | Technology |
|---|---|
| Frontend | SvelteKit v2, TailwindCSS v4, Bits UI v2 (headless) |
| API | Hono v4 on Cloudflare Workers (via Wrangler) |
| Database | PostgreSQL (Neon serverless) via Drizzle ORM |
| Auth | better-auth v1 with custom multi-tenant session handling |
| i18n | Inlang Paraglide v2 |
| Forms | TanStack Svelte Form + Zod validation |

### Multi-Tenancy Model

The data model enforces tenant isolation at the database level:

- **organizations** → top-level entity (e.g., a hospital group)
- **tenants** → scoped under an organization (e.g., individual hospitals/branches)
- **users** — a DB check constraint enforces: `superadmin` must have null `tenantId`/`organizationId`; all other roles must have both set
- All resource tables (`patients`, `appointments`, etc.) carry a `tenantId` FK

### API Structure (`apps/api/`)

Entry point: `apps/api/src/index.ts`

- Global middleware: `logger()`, dynamic CORS (reads `BETTER_AUTH_TRUSTED_ORIGINS` env var)
- DB middleware applied to `/api/*` and `/internal/*`
- Routes mounted at `/api/v1/{resource}` — patients, appointments, opd, ipd, pharmacy, billing, laboratory, radiology, inventory, staff, reports
- Internal/admin routes at `/internal/*`
- Route files use `authMiddleware` + `tenantMiddleware` on `router.use('*', ...)` to protect all endpoints
- `superadmin` users bypass tenant filtering; all other roles are scoped to their `tenantId`

### Shared UI Components

`packages/ui` re-exports shadcn-svelte-style components. Both SvelteKit apps alias `$lib/components/ui` to `packages/ui/src/components/ui` via `svelte.config.js` path aliases — do not duplicate UI components inside individual apps.

### Auth Flow

1. SvelteKit `hooks.server.ts` calls `/api/v1/auth/get-session` on every request
2. Session stored in `event.locals` (typed in `app.d.ts`)
3. `tenantId` and `organizationId` are extracted from the session and forwarded as request context through Hono middleware

### Database Schema Location

All schema definitions live in `packages/api/src/db/schema.ts`. Run `pnpm db:generate` from the root after schema changes to produce migrations in `packages/api/drizzle/`.

### Environment Variables

Copy `.env.example` to `.env` at the repo root. Key variables:

- `DATABASE_URL` — Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Auth signing secret
- `BETTER_AUTH_TRUSTED_ORIGINS` — Comma-separated allowed origins
- `API_URL` — Server-side API URL (used in SvelteKit hooks)
- `PUBLIC_API_URL` — Client-side API URL

The API app (`apps/api`) uses Wrangler bindings instead of a `.env` file; configure secrets via `wrangler secret put` or `wrangler.toml` for local dev.

### Code Style

- Prettier: `semi: true`, `singleQuote: false`, `tabWidth: 2`, `trailingComma: "all"`, `printWidth: 100`
- ESLint flat config; `@typescript-eslint/no-explicit-any` is an error; unused vars with `_` prefix are allowed
- `verbatimModuleSyntax: true` — always use `import type` for type-only imports
