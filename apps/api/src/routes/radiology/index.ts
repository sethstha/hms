import { OpenAPIHono } from "@hono/zod-openapi";

// TODO: Add Radiology routes
// Routes will follow: GET /, GET /:id, POST /, PUT /:id
// Covers: imaging orders, DICOM references, radiology reports

const router = new OpenAPIHono();

export default router;
