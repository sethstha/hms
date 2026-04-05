import { OpenAPIHono } from "@hono/zod-openapi";

// TODO: Add Laboratory routes
// Routes will follow: GET /, GET /:id, POST /, PUT /:id
// Covers: test orders, results, report generation

const router = new OpenAPIHono();

export default router;
