import type { AppEnv } from "@hms/auth/types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { authMiddleware } from "../../middleware/auth";
import { orgMiddleware, requireFeature } from "../../middleware/org";

// TODO: Add Inventory routes
// Routes will follow: GET /, GET /:id, POST /, PUT /:id
// Covers: stock items, purchase orders, stock adjustments, expiry tracking

const router = new OpenAPIHono<AppEnv>();
router.use("*", authMiddleware, orgMiddleware, requireFeature("inventory"));

export default router;
