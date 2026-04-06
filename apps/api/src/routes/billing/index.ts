import type { AppEnv } from "@hms/auth/types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { authMiddleware } from "../../middleware/auth";
import { orgMiddleware, requireFeature } from "../../middleware/org";

// TODO: Add Billing routes
// Routes will follow: GET /, GET /:id, POST /, PUT /:id
// Covers: invoices, payments, receipts, insurance claims

const router = new OpenAPIHono<AppEnv>();
router.use("*", authMiddleware, orgMiddleware, requireFeature("billing"));

export default router;
