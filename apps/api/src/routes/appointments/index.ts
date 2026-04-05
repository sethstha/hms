import type { AppEnv } from "@hms/api/types";
import { patients } from "@hms/db/schema";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth";
import { tenantMiddleware } from "../../middleware/tenant";

const router = new OpenAPIHono<AppEnv>();
router.use("*", authMiddleware, tenantMiddleware);

// ─── Shared schemas ────────────────────────────────────────────────────────────

const patientSchema = z.object({
  id: z.string(),
  uhid: z.string(),
  name: z.string(),
  dateOfBirth: z.string(),
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  tenantId: z.string().nullable(),
});

const createPatientSchema = z.object({
  uhid: z.string().min(1),
  name: z.string().min(1),
  dateOfBirth: z.string(),
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
});

const errorSchema = z.object({ error: z.string() });

// ─── List ──────────────────────────────────────────────────────────────────────

router.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Patients"],
    summary: "List all patients",
    responses: {
      200: {
        content: { "application/json": { schema: z.object({ data: z.array(patientSchema) }) } },
        description: "List of patients",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const user = c.get("user")!;

    const results = user.tenantId
      ? await db.select().from(patients).where(eq(patients.tenantId, user.tenantId))
      : await db.select().from(patients);

    return c.json({ data: results }, 200 as const);
  },
);

// ─── Get one ──────────────────────────────────────────────────────────────────

router.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    tags: ["Patients"],
    summary: "Get a patient by ID",
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        content: { "application/json": { schema: z.object({ data: patientSchema }) } },
        description: "Patient details",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Patient not found",
      },
      403: {
        content: { "application/json": { schema: errorSchema } },
        description: "Forbidden",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const user = c.get("user")!;
    const { id } = c.req.valid("param");

    const [patient] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);

    if (!patient) return c.json({ error: "Patient not found." }, 404 as const);

    if (user.role !== "superadmin" && patient.tenantId !== user.tenantId) {
      return c.json({ error: "Forbidden." }, 403 as const);
    }

    return c.json({ data: patient }, 200 as const);
  },
);

// ─── Create ───────────────────────────────────────────────────────────────────

router.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Patients"],
    summary: "Create a patient",
    request: {
      body: {
        content: { "application/json": { schema: createPatientSchema } },
      },
    },
    responses: {
      201: {
        content: { "application/json": { schema: z.object({ data: patientSchema }) } },
        description: "Patient created",
      },
      403: {
        content: { "application/json": { schema: errorSchema } },
        description: "Forbidden",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const user = c.get("user")!;
    const data = c.req.valid("json");

    if (!user.tenantId)
      return c.json({ error: "Your account has no tenant assigned." }, 403 as const);

    const [patient] = await db
      .insert(patients)
      .values({ ...data, tenantId: user.tenantId })
      .returning();

    return c.json({ data: patient }, 201 as const);
  },
);

// ─── Update ───────────────────────────────────────────────────────────────────

router.openapi(
  createRoute({
    method: "patch",
    path: "/{id}",
    tags: ["Patients"],
    summary: "Update a patient",
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: { "application/json": { schema: createPatientSchema.partial() } },
      },
    },
    responses: {
      200: {
        content: { "application/json": { schema: z.object({ data: patientSchema }) } },
        description: "Patient updated",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Patient not found",
      },
      403: {
        content: { "application/json": { schema: errorSchema } },
        description: "Forbidden",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const user = c.get("user")!;
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");

    const [existing] = await db
      .select({ tenantId: patients.tenantId })
      .from(patients)
      .where(eq(patients.id, id))
      .limit(1);

    if (!existing) return c.json({ error: "Patient not found." }, 404 as const);

    if (user.role !== "superadmin" && existing.tenantId !== user.tenantId) {
      return c.json({ error: "Forbidden." }, 403 as const);
    }

    const [updated] = await db.update(patients).set(data).where(eq(patients.id, id)).returning();

    return c.json({ data: updated }, 200 as const);
  },
);

// ─── Delete ───────────────────────────────────────────────────────────────────

router.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    tags: ["Patients"],
    summary: "Delete a patient",
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        content: { "application/json": { schema: z.object({ success: z.boolean() }) } },
        description: "Patient deleted",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Patient not found",
      },
      403: {
        content: { "application/json": { schema: errorSchema } },
        description: "Forbidden",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const user = c.get("user")!;
    const { id } = c.req.valid("param");

    const [existing] = await db
      .select({ tenantId: patients.tenantId })
      .from(patients)
      .where(eq(patients.id, id))
      .limit(1);

    if (!existing) return c.json({ error: "Patient not found." }, 404 as const);

    if (user.role !== "superadmin" && existing.tenantId !== user.tenantId) {
      return c.json({ error: "Forbidden." }, 403 as const);
    }

    await db.delete(patients).where(eq(patients.id, id));

    return c.json({ success: true }, 200 as const);
  },
);

export default router;
