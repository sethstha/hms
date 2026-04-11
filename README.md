# HMS Monorepo

## 1. Project Overview

HMS (Hospital Management System) is a multi-tenant SaaS platform for hospital chains. A single API backend serves many hospital organizations ("tenants"), each isolated from one another.

**Two user-facing apps:**

| App | Users | URL (dev) |
|-----|-------|-----------|
| `apps/admin` | Platform superadmins and admins — manage organizations, tenants, users across the whole system | `http://localhost:5174` |
| `apps/orgs` | Staff at hospitals, clinics, pharmacies, and polyclinics — doctors, nurses, receptionists, pharmacists, lab techs, billing staff | `http://localhost:5173` |

---

## 2. Monorepo Structure

```
hms/
├── apps/
│   ├── admin/          SvelteKit SPA — platform admin console (adapter-static, ssr=false)
│   ├── orgs/           SvelteKit SPA — org staff portal: hospitals, clinics, pharmacies, polyclinics (adapter-static, ssr=false)
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
| `@hms/auth` | `createAdminAuth`, `createHospitalAuth`, auth clients, `adminRoutes`, `orgRoutes`, middleware guards | `apps/api`, `apps/admin`, `apps/orgs` |
| `@hms/db` | `createDb`, `Db` type, all Drizzle schema tables | `@hms/auth`, `apps/api` |
| `@hms/schemas` | Zod schemas and inferred types for all domain objects | `apps/api`, `apps/admin`, `apps/orgs`, `@hms/types` |
| `@hms/ui` | shadcn-svelte components + `theme.css` | `apps/admin`, `apps/orgs` |
| `@hms/utils` | `cn()`, date formatters, number formatters, `isMobile`, `adminRoutes`, `orgRoutes` | `@hms/ui`, `apps/admin`, `apps/orgs` |
| `@hms/types` | Re-exports everything from `@hms/schemas` | `apps/admin`, `apps/orgs` |

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

### `apps/admin` and `apps/orgs`
| Tool | Version | Notes |
|------|---------|-------|
| SvelteKit | ^2.56.1 | App framework |
| Svelte | ^5.54.0 | Runes-only (enforced in svelte.config.js) |
| `@sveltejs/adapter-static` | ^3.x | SPA mode — `ssr = false`, `prerender = true` in root `+layout.ts`; build output to `build/` |
| Tailwind CSS v4 | ^4.1.18 | Via `@tailwindcss/vite` — no config file |
| `@inlang/paraglide-js` | ^2.10.0 | i18n: English (`en`) + Nepali (`np`) |
| `@tanstack/svelte-form` | ^1.28.6 | Form state management and submission |
| `@tanstack/svelte-query` | ^5.90.2 | Client-side data fetching and caching (all data from API, no SSR hydration) |
| `@tanstack/svelte-table` | ^8.x | Table rendering for all listings from API |

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
# Prompts you to select: Orgs, Admin Panel, API Server
```

### Start individual services
```bash
pnpm dev:orgs       # http://localhost:5173
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
pnpm build:orgs
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

### Auth: fully client-side (SPA mode)

Both apps are SPAs (`ssr = false`). There are no server load functions, no `hooks.server.ts`, and no server-side session fetching. All auth is handled entirely in the browser:

1. The root `+layout.svelte` calls `authClient.getSession()` inside `onMount` to fetch the session from the API using the browser's cookie jar.
2. The result is stored in a `$state` variable and shared via Svelte context: `setContext("session", session)`. Child routes read it with `getContext`.
3. Route protection is done in `+layout.svelte` via `onMount` — if there is no session, use `goto()` to redirect to login. Never use `+layout.server.ts` for guards.
4. Route strings are **never hardcoded** — always import `adminRoutes` or `orgRoutes` from `@hms/utils`:
   ```typescript
   import { adminRoutes } from "@hms/utils";
   goto(adminRoutes.login);   // ✓
   goto("/login");            // ✗ — hardcoded string
   ```
5. Better Auth cookies are configured `SameSite=none; Secure` to work cross-origin between the Pages app and the Worker API.

**SPA mode rules — strictly enforced:**
- **Never create `+page.server.ts` or `+layout.server.ts` files** — these require SSR and will break the static build
- **Never create `hooks.server.ts`** — no server hook context exists
- **Never use `load` functions with server context** (`event.locals`, `event.request`, `platform`)
- **Never import from `$app/server`** or use any SvelteKit server-only API
- All data fetching happens client-side via `onMount` or TanStack Query
- All auth checks happen client-side via `authClient.getSession()`

### Data fetching: TanStack Query, client-side only (mandatory pattern)

Both `apps/admin` and `apps/orgs` use `@tanstack/svelte-query` v5 for **all data fetching from the API**. Because both apps are SPAs (`ssr = false`), there is no SSR prefetch/hydration step — queries run entirely in the browser. The setup lives in two files per app:

- **`src/lib/query/client.ts`** — exports a `QueryClient` singleton (safe here because there is only one browser tab, not shared server state). Used to wrap the app in `QueryClientProvider`.
- **`src/lib/api/client.ts`** — exports `apiFetch<T>(path, init?)` and `ApiError`. All `queryFn` callbacks call this. It reads `PUBLIC_API_URL` from `$env/dynamic/public` and sets `credentials: "include"` so the browser sends the session cookie automatically.

**Client-side query pattern** (used in every data-fetching route):

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { apiFetch } from "$lib/api/client";

  const orgsQuery = createQuery({
    queryKey: ["organizations"],
    queryFn: () => apiFetch("/api/v1/organizations"),
  });
</script>

{#if $orgsQuery.isPending}
  <p>Loading...</p>
{:else if $orgsQuery.error}
  <p>Error: {$orgsQuery.error.message}</p>
{:else}
  <!-- render $orgsQuery.data -->
{/if}
```

**Key rules:**
- No `+page.server.ts`, no `dehydrate()`, no `HydrationBoundary` — those are SSR patterns and must not be used
- `createQuery` returns a Svelte store — access reactive values with the `$` prefix: `$orgsQuery.data`, `$orgsQuery.isPending`, `$orgsQuery.error`
- Default `staleTime` is 30 seconds. Override per-query with `queryOptions({ staleTime: Infinity })` for static data or `staleTime: 0` for live data
- The `credentials: "include"` on `apiFetch` is what forwards the Better Auth cookie cross-origin to the Worker

### Data listings: TanStack Table (mandatory for all API lists)

Every listing, table, or grid that displays data fetched from the API **must use `@tanstack/svelte-table`** for rendering. This includes:

- User lists, patient lists, appointment lists, etc. in both apps
- Any paginated or sortable data from the API

**Pattern:**

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { createSvelteTable, getCoreRowModel } from "@tanstack/svelte-table";
  import { apiFetch } from "$lib/api/client";
  import type { ColumnDef } from "@tanstack/svelte-table";

  const patientsQuery = createQuery({
    queryKey: ["patients"],
    queryFn: () => apiFetch("/api/v1/patients"),
  });

  const columns: ColumnDef<Patient>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
  ];

  const table = createSvelteTable({
    get data() {
      return $patientsQuery.data ?? [];
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
</script>

<table>
  {#each $table.getHeaderGroups() as headerGroup}
    <tr>
      {#each headerGroup.headers as header}
        <th>
          {#if !header.isPlaceholder}
            <svelte:component
              this={FlexibleRender}
              content={header.column.columnDef.header}
              props={{ column: header.column, header }}
            />
          {/if}
        </th>
      {/each}
    </tr>
  {/each}
  <tbody>
    {#each $table.getRowModel().rows as row}
      <tr>
        {#each row.getVisibleCells() as cell}
          <td>
            <svelte:component
              this={FlexibleRender}
              content={cell.column.columnDef.cell}
              props={{ getValue: cell.getValue, row: cell.row }}
            />
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
```

**Key rules:**
- No `HydrationBoundary` — this is a SPA; data loads client-side and the table reactively updates when the query resolves
- Column definitions are defined client-side; data comes from `$query.data`
- For sorting, filtering, or pagination, extend the API endpoint to support query parameters (`?sort=name&order=asc&page=1`) and pass those through in the `queryFn`
- Use `getCoreRowModel()` for basic rendering; add `getSortedRowModel()`, `getFilteredRowModel()`, etc. as needed

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

### Deployment

The three deployable units are independent — a full-stack change requires deploying both:

| Unit | Platform | Deploy command | Notes |
|------|----------|---------------|-------|
| `apps/admin` | Cloudflare Pages | `pnpm build:admin` + Pages CI | Deploys to `hms-admin-sethstha.pages.dev` |
| `apps/orgs` | Cloudflare Pages | `pnpm build:orgs` + Pages CI | Deploys to its own Pages project |
| `apps/api` | Cloudflare Workers | `pnpm build:api` (`wrangler deploy`) | Deployed independently via Wrangler |

Pages deployments and Worker deployments are **independent**. If you change API routes and frontend calls together, both must be deployed.

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

### Forms: `@tanstack/svelte-form` (mandatory)

All forms in both apps **must use `@tanstack/svelte-form`** for state management and submission. Never use manual `$state` for form fields or submit handlers.

**Pattern:**

```svelte
<script lang="ts">
  import { useForm } from "@tanstack/svelte-form";
  import { zodValidator } from "@tanstack/zod-form-adapter";
  import { createPatientSchema } from "@hms/schemas/patients";

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
    },
    onSubmit: async ({ value }) => {
      await apiFetch("/api/v1/patients", {
        method: "POST",
        body: JSON.stringify(value),
      });
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: createPatientSchema,
    },
  });

  const handleSubmit = form.handleSubmit;
</script>

<form onsubmit={handleSubmit}>
  <input
    name="name"
    value={$form.getFieldValue("name")}
    onchange={(e) => form.setFieldValue("name", e.currentTarget.value)}
  />
  <button type="submit">Create</button>
</form>
```

**Key rules:**
- Use `@tanstack/zod-form-adapter` to validate with `@hms/schemas` schemas
- All errors come from `form.state.fieldMeta` — never manage validation yourself
- Form submission is async; handle loading states via `form.state.isSubmitting`

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

### `apps/admin` and `apps/orgs` — stored in `.env`

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

### Never add server-side SvelteKit files
Both apps are SPAs (`ssr = false`, `adapter-static`). The following files must **never** exist in `apps/admin` or `apps/orgs`:
- `+page.server.ts` / `+layout.server.ts` — require SSR; will break the static build
- `hooks.server.ts` — no server hook context in SPA mode
- Any `load` function that uses `event.locals`, `event.request`, or `platform`
- Any import from `$app/server`

If you need data on page load, fetch it client-side inside `onMount` or via a TanStack Query `createQuery`.

### Always use `@hms/ui/theme.css` (not `styles.css`) in app CSS
The package exports `./theme.css` only. The import `@hms/ui/styles.css` seen in `apps/orgs/src/app.css` is incorrect — there is no `styles.css` export. The correct import is:
```css
@import "@hms/ui/theme.css";
```

### `@hms/types` is a deprecated re-export shim
`packages/types/src/index.ts` just does `export * from "@hms/schemas"`. Prefer importing from `@hms/schemas` directly in new code.

### Tailwind classes in `packages/ui` are invisible to apps without `@source`
Tailwind v4 only scans files it can see. The `@source "../../../../packages/ui/src"` line in each app's CSS is what makes shared component classes available. Do not remove it.

### `createDb` is called per request — this is correct
`createDb(databaseUrl)` creates a lightweight Neon HTTP client. Do not try to hoist it to module scope or cache it globally on the Worker; the Neon serverless driver makes each query an independent HTTP request and there is no connection to reuse.

### QueryClient is a browser singleton in SPA mode
Both apps run entirely in the browser. A module-level `QueryClient` singleton in `$lib/query/client.ts` is correct here — there is only one browser tab and no shared server state. Do not call `createQueryClient()` per component or per query; use the single shared instance registered in `QueryClientProvider`.

### Never fetch data in components without TanStack Query
All data fetching from the API must go through `@tanstack/svelte-query`. Do not use raw `fetch()` or manual `$state`/`$effect` to fetch data. This ensures proper caching, loading states, and deduplication across both apps.

### Never manage form state manually
Use `@tanstack/svelte-form` for all forms in both apps. Manual form state with `$state` or individual reactive variables is a code smell and leads to inconsistent error handling, validation, and submission logic.

### Every list from the API must use TanStack Table
Data listings (tables, grids, paginated results) that come from the API **must be rendered with `@tanstack/svelte-table`**. Do not use `{#each}` directly on API data or custom table components. TanStack Table provides consistent sorting, filtering, pagination, and row selection across both apps.

### Never hardcode route strings
Always import `adminRoutes` or `orgRoutes` from `@hms/utils` for navigation and route checks. Hardcoded strings like `"/dashboard"` or `"/login"` will drift from the actual route definitions:
```typescript
import { adminRoutes } from "@hms/utils";
goto(adminRoutes.login);   // ✓
goto("/login");            // ✗
```

### Rate limiting is not yet implemented
`apps/api/src/middleware/ratelimit.ts` is a passthrough stub. The TODO comments describe the intended implementation.

### Internal routes (`/internal/*`) are empty
`apps/api/src/routes/internal/index.ts` is a stub. These routes are intended for platform admin operations (tenant management, feature flags) and will require internal API key auth.
