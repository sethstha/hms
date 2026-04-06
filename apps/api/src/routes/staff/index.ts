import type { AppEnv } from "@hms/auth/types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { authMiddleware } from "../../middleware/auth";
import { orgMiddleware } from "../../middleware/org";

// TODO: Add Staff routes
// Routes will follow: GET /, GET /:id, POST /, PUT /:id
// Covers: doctors, nurses, staff profiles, schedules, departments

const router = new OpenAPIHono<AppEnv>();
// staff is a core resource — no specific feature flag required
router.use("*", authMiddleware, orgMiddleware);

export default router;
