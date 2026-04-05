import { OpenAPIHono } from "@hono/zod-openapi";

// TODO: Add IPD (Inpatient Department) routes
// Routes will follow: GET /, GET /:id, POST /, PUT /:id
// Covers: admissions, discharges, bed assignments, ward rounds

const router = new OpenAPIHono();

export default router;
