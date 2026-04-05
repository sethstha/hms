import { OpenAPIHono } from "@hono/zod-openapi";

// TODO: Add internal admin-only routes (no /api/v1 prefix)
// Covers: tenant management, platform admin ops, feature flags, system health
// These routes should require internal API key authentication

const router = new OpenAPIHono();

export default router;
