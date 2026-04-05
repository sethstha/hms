import { OpenAPIHono } from "@hono/zod-openapi";

// TODO: Add Staff routes
// Routes will follow: GET /, GET /:id, POST /, PUT /:id
// Covers: doctors, nurses, staff profiles, schedules, departments

const router = new OpenAPIHono();

export default router;
