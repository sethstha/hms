import type { AppEnv } from "@hms/auth/types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { authMiddleware } from "../../middleware/auth";
import { orgMiddleware, requireFeature } from "../../middleware/org";

// TODO: Add Reports routes
// Routes: GET /daily-summary, GET /revenue, GET /occupancy, etc.
// Covers: analytics, dashboards, exports (CSV/PDF)

const router = new OpenAPIHono<AppEnv>();
router.use("*", authMiddleware, orgMiddleware, requireFeature("reports"));

export default router;
