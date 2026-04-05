import { OpenAPIHono } from "@hono/zod-openapi";

// TODO: Add Reports routes
// Routes: GET /daily-summary, GET /revenue, GET /occupancy, etc.
// Covers: analytics, dashboards, exports (CSV/PDF)

const router = new OpenAPIHono();

export default router;
