## 1. Project Overview

HMS (Hospital Management System) is a multi-tenant SaaS platform for hospital chains. A single API backend serves many hospital organizations ("tenants"), each isolated from one another.

**Two user-facing apps:**

| App | Users | URL (dev) |
|-----|-------|-----------|
| `apps/admin` | Platform superadmins and admins — manage organizations, tenants, users across the whole system | `http://localhost:5174` |
| `apps/hospital` | Hospital staff — doctors, nurses, receptionists, pharmacists, lab techs, billing staff | `http://localhost:5173` |

---

## 2. Monorepo Structure

```
hms/
├── apps/
│   ├── admin/          SvelteKit SPA — platform admin console
│   ├── hospital/       SvelteKit SPA — hospital staff portal
│   └── api/            Hono API on Cloudflare Workers
├── packages/
│   ├── auth/           @hms/auth    — better-auth instances, clients, session helpers, middleware
│   ├── db/             @hms/db      — Drizzle schema, createDb factory, migrations
│   ├── schemas/        @hms/schemas — all Zod schemas (single source of truth)
│   ├── ui/             @hms/ui      — shadcn-svelte component library + Tailwind theme
│   ├── utils/          @hms/utils   — cn(), date-fns, formatters, isMobile hook
│   └── types/          @hms/types   — re-exports @hms/schemas (backward-compat shim only)
├── scripts/
│   └── dev.js          Interactive dev launcher (select which services to start)
├── package.json        Root — workspace scripts, shared devDependencies
├── pnpm-workspace.yaml
├── tsconfig.json       Root TypeScript config (all @hms/* path aliases defined here)
└── eslint.config.mjs   Flat ESLint config for the whole monorepo
```

### What each package exports and who consumes it

| Package | Exports | Consumed by |
|---------|---------|-------------|
| `@hms/auth` | `createAdminAuth`, `createHospitalAuth`, auth clients, `createSession`, `fetchSession`, `readTenant`, middleware guards | `apps/api`, `apps/admin`, `apps/hospital` |
| `@hms/db` | `createDb`, `Db` type, all Drizzle schema tables | `@hms/auth`, `apps/api` |
| `@hms/schemas` | Zod schemas and inferred types for all domain objects | `apps/api`, `apps/admin`, `apps/hospital`, `@hms/types` |
| `@hms/ui` | shadcn-svelte components + `theme.css` | `apps/admin`, `apps/hospital` |
| `@hms/utils` | `cn()`, date formatters, number formatters, `isMobile` | `@hms/ui`, `apps/admin`, `apps/hospital` |
| `@hms/types` | Re-exports everything from `@hms/schemas` | `apps/admin`, `apps/hospital` |

---

## 3. Tech Stack

### `apps/api`
| Tool | Version | Notes |
|------|---------|-------|
| Hono | ^4.6.0 | HTTP framework for Cloudflare Workers |
| `@hono/zod-openapi` | ^1.2.4 | `OpenAPIHono` + `createRoute` for typed, documented routes |
| `@scalar/hono-api-reference` | ^0.10.6 | Swagger UI replacement at `/docs` |
| Drizzle ORM | ^0.44.0 | SQL query builder |
| Zod | ^4.0.0 | Schema validation (via `@hms/schemas`) |
| Wrangler | ^4.20.0 | Cloudflare Workers dev + deploy |
| TypeScript | root `^6.0.2` | |

### `apps/admin` and `apps/hospital`
| Tool | Version | Notes |
|------|---------|-------|
| SvelteKit | ^2.56.1 | App framework |
| Svelte | ^5.54.0 | Runes-only (enforced in svelte.config.js) |
| `@sveltejs/adapter-static` | ^3.0.10 | Pure SPA output (`fallback: "200.html"`) |
| Tailwind CSS v4 | ^4.1.18 | Via `@tailwindcss/vite` — no config file |
| `@inlang/paraglide-js` | ^2.10.0 | i18n: English (`en`) + Nepali (`np`) |
| `@tanstack/svelte-form` | ^1.28.6 | Form state (admin only) |

### `packages/auth`
| Tool | Notes |
|------|-------|
| better-auth | ^1.5.5 — two separate instances, one per user domain |

### `packages/db`
| Tool | Notes |
|------|-------|
| `@neondatabase/serverless` | ^0.10.4 — Neon Postgres via HTTP (edge-compatible) |
| Drizzle Kit | ^0.31.0 — migrations |

### `packages/ui`
| Tool | Notes |
|------|-------|
| bits-ui | ^2.16.5 — headless primitives for shadcn-svelte |
| shadcn-svelte | ^1.2.7 — component scaffolding |
| tailwind-variants | ^3.2.2 |
| layerchart | 2.0.0-next.48 — charts |
| formsnap + sveltekit-superforms | form helpers |

---

## 4. Development Commands

### Install
```bash
pnpm install
```

### Start dev servers (interactive)
```bash
pnpm dev
# Prompts you to select: Hospital, Admin Panel, API Server
```

### Start individual services
```bash
pnpm dev:hospital   # http://localhost:5173
pnpm dev:admin      # http://localhost:5174
pnpm dev:api        # http://localhost:8787
```

### Type-check all packages
```bash
pnpm check          # runs svelte-check across apps
```

### Database
```bash
pnpm db:generate    # drizzle-kit generate (requires DATABASE_URL)
pnpm db:migrate     # drizzle-kit migrate
pnpm db:seed        # tsx packages/db/src/seed.ts
```

### Lint and format
```bash
pnpm lint           # eslint . (root flat config)
pnpm lint:fix
pnpm format         # prettier --write .
pnpm format:check
```

### Build
```bash
pnpm build:admin
pnpm build:hospital
pnpm build:api      # runs wrangler deploy
```

### API dev environment
The API reads secrets from `apps/api/.dev.vars` (gitignored). Copy from `.dev.vars.example`:
```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
# Fill in DATABASE_URL and BETTER_AUTH_SECRET
```
The `pnpm dev:api` script runs `scripts/prepare-dev-vars.mjs` before `wrangler dev` to validate the vars file.

### Known gotcha: admin vite port
`apps/admin/vite.config.ts` has `port: 5174` at the top-level `defineConfig` object, not nested under `server`. Vite ignores top-level unknown keys; the actual port defaults to 5173 unless `server.port` is set. The admin app may conflict with the hospital app on the same port in some Vite versions. If both run on 5173, add `server: { port: 5174 }` to `apps/admin/vite.config.ts`.

---

## 5. Architecture Decisions

### Auth: two better-auth instances, one API

The API mounts two completely independent better-auth instances on different base paths:

```
POST /auth/admin/*     → createAdminAuth(...)   — for platform users (superadmin, admin, support)
POST /auth/hospital/*  → createHospitalAuth(...) — for hospital staff (doctor, nurse, etc.)
```

Each instance has its own role system and plugin set. Both share the same Postgres tables (`users`, `user_sessions`, `accounts`, `verifications`) but are logically separate because `better-auth` keys sessions by the `basePath`.

**Instances are cached by config key** (`packages/auth/src/admin.ts` and `hospital.ts`) to avoid re-creating them on every Cloudflare Worker request.

### Auth: client-side only session in SPA

Both SvelteKit apps are **pure client-side SPAs** — `adapter-static` with no SSR. There are no `hooks.server.ts` files. Session management works entirely in the browser:

1. The root `+layout.svelte` calls `createSession(() => authClient.getSession())` on mount
2. `createSession` (from `@hms/auth/session`) returns a reactive `SessionState<T>` object using Svelte 5 runes (`$state`)
3. The session is stored in Svelte context: `setContext("session", session)`
4. Child routes read it with `getContext<SessionState<AppSession>>("session")`
5. Route guards are `$effect(() => { if (!session.loading) goto(...) })` — pure client-side redirects

The `fetchSession` export in `@hms/auth/session` exists for future server-side use if SSR is ever added.

### Multi-tenancy

The data model follows a two-level hierarchy:

```
organizations (hospital groups / chains)
    └── tenants (individual hospitals)
            └── users, patients, appointments, ...
```

**DB constraint** (enforced at the Postgres level in `packages/db/src/schema/users.ts`):
```sql
(role = 'superadmin' AND tenant_id IS NULL AND organization_id IS NULL)
OR
(role <> 'superadmin' AND tenant_id IS NOT NULL AND organization_id IS NOT NULL)
```
Superadmins have no tenant scope. All other users must have both `tenantId` and `organizationId`.

**API enforcement** (`tenantMiddleware` in `apps/api/src/middleware/tenant.ts`):
- Superadmins can optionally pass `x-tenant-id` header to operate on a specific tenant
- Regular users cannot cross tenant boundaries — the middleware compares the request's `x-tenant-id` against `user.tenantId` and rejects mismatches with 403
- Every route that handles tenant data uses both `authMiddleware` + `tenantMiddleware`

### API: Hono on Cloudflare Workers

- Entry point: `apps/api/src/index.ts`
- `OpenAPIHono<AppEnv>` is used throughout — this generates the OpenAPI spec automatically from `createRoute(...)` definitions
- All routes live under `/api/v1/...` except auth (`/auth/...`), docs (`/docs`, `/openapi.json`), and internal admin routes (`/internal/...`)
- Docs are protected by HTTP Basic Auth using `DOCS_USERNAME` / `DOCS_PASSWORD` env vars. If these are not set, `/docs` returns 503
- `AppEnv` type (in `@hms/auth/types`) defines Cloudflare Worker bindings and Hono context variables: `db`, `user`, `session`, `tenant`

### Database: Drizzle + Neon Postgres

```typescript
// packages/db/src/index.ts
export function createDb(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}
```

`createDb` is called **per-request** in `dbMiddleware` — this is intentional. Neon's serverless HTTP driver is stateless (each query is an HTTP request), so there is no persistent connection to reuse. The `db` instance is lightweight and safe to create on every request.

### UI: shadcn-svelte + Tailwind v4

- All components live in `packages/ui/src/components/ui/`
- The package exposes a single `index.ts` with flat and namespaced exports
- Tailwind v4 has **no `tailwind.config.ts`**. Design tokens are defined in `packages/ui/src/theme.css` using `@theme inline` which bridges shadcn-svelte CSS variables to Tailwind utility classes
- Apps import the theme via CSS:
  ```css
  /* apps/admin/src/routes/layout.css */
  @import "tailwindcss";
  @import "@hms/ui/theme.css";
  @source "../../../../packages/ui/src";  /* tells Tailwind to scan ui package classes */
  ```
- The `@source` directive is critical — without it, Tailwind v4 won't generate utility classes used inside `packages/ui`

### Schemas: Zod in `@hms/schemas` only

All Zod schemas live in `packages/schemas/`. Apps and the API import from `@hms/schemas` — they never define their own Zod schemas. The sub-exports are:

```
@hms/schemas              → all schemas (barrel)
@hms/schemas/auth         → loginSchema, registerSchema
@hms/schemas/patients     → patientSchema, createPatientSchema, updatePatientSchema
@hms/schemas/appointments → (appointment schemas)
@hms/schemas/billing      → (billing schemas)
@hms/schemas/common       → errorSchema, successSchema
```

---

## 6. Coding Conventions

### TypeScript
- `strict: true`, `noImplicitAny: true`, `strictNullChecks: true` enforced via root `tsconfig.json`
- **Never use `any`** — ESLint rule `@typescript-eslint/no-explicit-any: error` will fail
- Unused variables prefixed with `_` are allowed (`argsIgnorePattern: '^_'`)
- All `@hms/*` imports use `workspace:*` in `package.json`

### Svelte
- **Svelte 5 runes only** — `$state`, `$derived`, `$effect`, `$props`, `{@render}`, `{#snippet}` — no legacy stores, no `writable()`, no `onMount` for reactive state
- The `runes: true` compiler option is enforced via `svelte.config.js` for all non-`node_modules` files
- Component imports: `import { Button, Card } from "@hms/ui"` for flat exports; `<Card.Root>`, `<Card.Header>` for compound components

### Hono / API
- **Always use `as const` on HTTP status codes** in OpenAPIHono responses:
  ```typescript
  return c.json({ data: patient }, 200 as const);   // ✓
  return c.json({ data: patient }, 200);             // ✗ — TypeScript won't narrow the response type
  ```
- **OpenAPI path parameters use `/{id}` not `/:id`**:
  ```typescript
  path: "/{id}",   // ✓ OpenAPI spec format
  path: "/:id",    // ✗ Hono path format — breaks spec generation
  ```
- Define routes with `createRoute(...)` and register with `router.openapi(...)`, not `router.get(...)`

### ESLint
- Root flat config at `eslint.config.mjs` covers all `.ts` and `.svelte` files
- `better-tailwindcss` plugin enforces Tailwind class ordering
- Svelte files are parsed with `typescript-eslint` parser

---

## 7. Environment Variables

### `apps/api` — stored in `.dev.vars` (local dev) and Cloudflare secrets (prod)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `BETTER_AUTH_SECRET` | Yes | Secret for signing sessions |
| `BETTER_AUTH_URL` | Yes | Base URL of the API itself (e.g. `http://localhost:8787`) |
| `BETTER_AUTH_TRUSTED_ORIGINS` | No | Comma-separated list of allowed CORS origins |
| `DOCS_USERNAME` | No | Basic auth username for `/docs` (omit to disable docs) |
| `DOCS_PASSWORD` | No | Basic auth password for `/docs` |

Copy `apps/api/.dev.vars.example` to `apps/api/.dev.vars` and fill in `DATABASE_URL` and `BETTER_AUTH_SECRET`.

### `apps/admin` and `apps/hospital` — stored in `.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_API_URL` | No | Base URL of the API (defaults to nothing, which uses the browser's current origin) |

The default `.env` in both apps sets `PUBLIC_API_URL=http://localhost:8787`.

---

## 8. Common Pitfalls

### Never import Zod or define schemas in apps
All Zod schemas belong in `packages/schemas/`. Apps import from `@hms/schemas`. Adding a `z.object(...)` directly in a route or component is a code smell.

### Never use `number` literals for Hono status codes in `openapi()` handlers
`OpenAPIHono` requires status codes to be literal types for response type inference. Always write:
```typescript
return c.json({ data }, 200 as const);
```

### Never use `/:param` style in `createRoute` path definitions
OpenAPI uses `/{param}` syntax. Using Hono's `:param` style in `createRoute` will corrupt the generated spec:
```typescript
path: "/{id}",   // ✓
path: "/:id",    // ✗
```
(Hono's `router.get("/:id")` syntax is fine for non-OpenAPI routes.)

### Don't add Zod to `@hms/auth` or `@hms/db`
These packages have no Zod dependency. Validation belongs in `@hms/schemas`.

### Don't put auth logic in SvelteKit server files
There are no `hooks.server.ts`, `+layout.server.ts`, or `+page.server.ts` files in these apps (they were intentionally removed). All auth is client-side. Adding server-side load functions would break the static adapter.

### Always use `@hms/ui/theme.css` (not `styles.css`) in app CSS
The package exports `./theme.css` only. The import `@hms/ui/styles.css` seen in `apps/hospital/src/app.css` is incorrect — there is no `styles.css` export. The correct import is:
```css
@import "@hms/ui/theme.css";
```

### `@hms/types` is a deprecated re-export shim
`packages/types/src/index.ts` just does `export * from "@hms/schemas"`. Prefer importing from `@hms/schemas` directly in new code.

### Tailwind classes in `packages/ui` are invisible to apps without `@source`
Tailwind v4 only scans files it can see. The `@source "../../../../packages/ui/src"` line in each app's CSS is what makes shared component classes available. Do not remove it.

### `createDb` is called per request — this is correct
`createDb(databaseUrl)` creates a lightweight Neon HTTP client. Do not try to hoist it to module scope or cache it globally on the Worker; the Neon serverless driver makes each query an independent HTTP request and there is no connection to reuse.

### Rate limiting is not yet implemented
`apps/api/src/middleware/ratelimit.ts` is a passthrough stub. The TODO comments describe the intended implementation.

### Internal routes (`/internal/*`) are empty
`apps/api/src/routes/internal/index.ts` is a stub. These routes are intended for platform admin operations (tenant management, feature flags) and will require internal API key auth.
