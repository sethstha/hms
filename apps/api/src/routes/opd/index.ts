import { OpenAPIHono } from "@hono/zod-openapi";

// TODO: Add OPD (Outpatient Department) routes
// Routes will follow: GET /, GET /:id, POST /, PUT /:id
// Covers: consultations, triage, vital signs

const router = new OpenAPIHono();

export default router;
