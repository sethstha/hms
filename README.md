# HMS

## Monorepo Structure

```text
apps/
  hospital/   # Hospital web app (SvelteKit)
  admin/      # Admin web app (SvelteKit)
packages/
  api/        # API server (Hono + Wrangler)
  db/         # Database package
  types/      # Shared TypeScript types/schemas
  ui/         # Shared UI components
  utils/      # Shared utilities
scripts/      # Root helper scripts (e.g., interactive dev runner)
```

## Development

```bash
pnpm install
cp .env.example .env
pnpm dev
```

`pnpm dev` opens an interactive selector to start one or more development servers.

```bash
pnpm dev:hospital  # http://localhost:5173
pnpm dev:admin     # http://localhost:5174
pnpm dev:api       # http://localhost:8787
```
