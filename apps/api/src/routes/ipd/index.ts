import type { AppEnv } from "@hms/auth/types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { authMiddleware } from "../../middleware/auth";
import { orgMiddleware, requireFeature } from "../../middleware/org";

// TODO: Add IPD (Inpatient Department) routes
// Routes will follow: GET /, GET /:id, POST /, PUT /:id
// Covers: admissions, discharges, bed assignments, ward rounds

const router = new OpenAPIHono<AppEnv>();
router.use("*", authMiddleware, orgMiddleware, requireFeature("ipd"));

export default router;
