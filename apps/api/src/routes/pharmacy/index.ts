import type { AppEnv } from "@hms/auth/types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { authMiddleware } from "../../middleware/auth";
import { orgMiddleware, requireFeature } from "../../middleware/org";

// TODO: Add Pharmacy routes
// Routes will follow: GET /, GET /:id, POST /, PUT /:id
// Covers: dispensing, stock management, prescription fulfillment

const router = new OpenAPIHono<AppEnv>();
router.use("*", authMiddleware, orgMiddleware, requireFeature("pharmacy"));

export default router;
