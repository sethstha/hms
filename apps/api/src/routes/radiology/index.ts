import type { AppEnv } from "@hms/auth/types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { authMiddleware } from "../../middleware/auth";
import { orgMiddleware, requireFeature } from "../../middleware/org";

// TODO: Add Radiology routes
// Routes will follow: GET /, GET /:id, POST /, PUT /:id
// Covers: imaging orders, DICOM references, radiology reports

const router = new OpenAPIHono<AppEnv>();
router.use("*", authMiddleware, orgMiddleware, requireFeature("radiology"));

export default router;
