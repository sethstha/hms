import { OpenAPIHono } from "@hono/zod-openapi";

// TODO: Add Billing routes
// Routes will follow: GET /, GET /:id, POST /, PUT /:id
// Covers: invoices, payments, receipts, insurance claims

const router = new OpenAPIHono();

export default router;
