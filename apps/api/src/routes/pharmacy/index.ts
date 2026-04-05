import { OpenAPIHono } from "@hono/zod-openapi";

// TODO: Add Pharmacy routes
// Routes will follow: GET /, GET /:id, POST /, PUT /:id
// Covers: dispensing, stock management, prescription fulfillment

const router = new OpenAPIHono();

export default router;
