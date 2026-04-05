import type { AppEnv } from "@hms/auth/types";
import {
  appointmentSchema,
  createAppointmentSchema,
  errorSchema,
  successSchema,
  updateAppointmentSchema,
} from "@hms/schemas";
import { appointments } from "@hms/db/schema";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth";
import { tenantMiddleware } from "../../middleware/tenant";

const router = new OpenAPIHono<AppEnv>();
router.use("*", authMiddleware, tenantMiddleware);

// ─── List ──────────────────────────────────────────────────────────────────────

router.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Appointments"],
    summary: "List all appointments",
    responses: {
      200: {
        content: {
          "application/json": { schema: z.object({ data: z.array(appointmentSchema) }) },
        },
        description: "List of appointments",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const user = c.get("user")!;

    const results = user.tenantId
      ? await db.select().from(appointments).where(eq(appointments.tenantId, user.tenantId))
      : await db.select().from(appointments);

    return c.json({ data: results }, 200 as const);
  },
);

// ─── Get one ──────────────────────────────────────────────────────────────────

router.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    tags: ["Appointments"],
    summary: "Get an appointment by ID",
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        content: { "application/json": { schema: z.object({ data: appointmentSchema }) } },
        description: "Appointment details",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Appointment not found",
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

    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);

    if (!appointment) return c.json({ error: "Appointment not found." }, 404 as const);

    if (user.role !== "superadmin" && appointment.tenantId !== user.tenantId) {
      return c.json({ error: "Forbidden." }, 403 as const);
    }

    return c.json({ data: appointment }, 200 as const);
  },
);

// ─── Create ───────────────────────────────────────────────────────────────────

router.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Appointments"],
    summary: "Create an appointment",
    request: {
      body: {
        content: { "application/json": { schema: createAppointmentSchema } },
      },
    },
    responses: {
      201: {
        content: { "application/json": { schema: z.object({ data: appointmentSchema }) } },
        description: "Appointment created",
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

    const [appointment] = await db
      .insert(appointments)
      .values({ ...data, tenantId: user.tenantId })
      .returning();

    return c.json({ data: appointment }, 201 as const);
  },
);

// ─── Update ───────────────────────────────────────────────────────────────────

router.openapi(
  createRoute({
    method: "patch",
    path: "/{id}",
    tags: ["Appointments"],
    summary: "Update an appointment",
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: { "application/json": { schema: updateAppointmentSchema } },
      },
    },
    responses: {
      200: {
        content: { "application/json": { schema: z.object({ data: appointmentSchema }) } },
        description: "Appointment updated",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Appointment not found",
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
      .select({ tenantId: appointments.tenantId })
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);

    if (!existing) return c.json({ error: "Appointment not found." }, 404 as const);

    if (user.role !== "superadmin" && existing.tenantId !== user.tenantId) {
      return c.json({ error: "Forbidden." }, 403 as const);
    }

    const [updated] = await db
      .update(appointments)
      .set(data)
      .where(eq(appointments.id, id))
      .returning();

    return c.json({ data: updated }, 200 as const);
  },
);

// ─── Delete ───────────────────────────────────────────────────────────────────

router.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    tags: ["Appointments"],
    summary: "Delete an appointment",
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        content: { "application/json": { schema: successSchema } },
        description: "Appointment deleted",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Appointment not found",
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
      .select({ tenantId: appointments.tenantId })
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);

    if (!existing) return c.json({ error: "Appointment not found." }, 404 as const);

    if (user.role !== "superadmin" && existing.tenantId !== user.tenantId) {
      return c.json({ error: "Forbidden." }, 403 as const);
    }

    await db.delete(appointments).where(eq(appointments.id, id));

    return c.json({ success: true }, 200 as const);
  },
);

export default router;
