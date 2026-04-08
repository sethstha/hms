import type { AppEnv } from "@hms/auth/types";
import {
  createPermissionSchema,
  errorSchema,
  permissionSchema,
  permissionSlugCheckSchema,
  successSchema,
  updatePermissionSchema,
} from "@hms/schemas";
import { permissions } from "@hms/db/schema";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { requireAdminSession, requireRole } from "@hms/auth/middleware";

const router = new OpenAPIHono<AppEnv>();

// ─── Slug availability check (public — no auth) ────────────────────────────────
router.openapi(
  createRoute({
    method: "get",
    path: "/slug-check",
    tags: ["Permissions"],
    summary: "Check if a permission slug is available",
    request: {
      query: permissionSlugCheckSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": { schema: z.object({ available: z.boolean() }) },
        },
        description: "Slug availability result",
      },
    },
  }),
  async (c) => {
    const { slug } = c.req.valid("query");
    const db = c.get("db");

    const [existing] = await db
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.slug, slug))
      .limit(1);

    return c.json({ available: !existing }, 200 as const);
  },
);

// ─── All routes below require superadmin ──────────────────────────────────────
router.use("*", requireAdminSession, requireRole("superadmin"));

// ─── List all active permissions ───────────────────────────────────────────────
router.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Permissions"],
    summary: "List all global permissions",
    responses: {
      200: {
        content: {
          "application/json": { schema: z.object({ data: z.array(permissionSchema) }) },
        },
        description: "List of permissions",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const results = await db
      .select()
      .from(permissions)
      .where(eq(permissions.isActive, true));
    return c.json({ data: results }, 200 as const);
  },
);

// ─── Create permission ────────────────────────────────────────────────────────
router.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Permissions"],
    summary: "Create a new global permission",
    request: {
      body: { content: { "application/json": { schema: createPermissionSchema } } },
    },
    responses: {
      201: {
        content: { "application/json": { schema: z.object({ data: permissionSchema }) } },
        description: "Permission created",
      },
      409: {
        content: { "application/json": { schema: errorSchema } },
        description: "Slug already taken",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const user = c.get("user")!;
    const data = c.req.valid("json");

    const [existing] = await db
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.slug, data.slug))
      .limit(1);

    if (existing) {
      return c.json({ error: "A permission with this slug already exists." }, 409 as const);
    }

    const [created] = await db
      .insert(permissions)
      .values({ ...data, createdBy: user.id })
      .returning();

    return c.json({ data: created }, 201 as const);
  },
);

// ─── Update permission (name + description only; slug is immutable) ───────────
router.openapi(
  createRoute({
    method: "patch",
    path: "/{id}",
    tags: ["Permissions"],
    summary: "Update a permission's name or description",
    request: {
      params: z.object({ id: z.string() }),
      body: { content: { "application/json": { schema: updatePermissionSchema } } },
    },
    responses: {
      200: {
        content: { "application/json": { schema: z.object({ data: permissionSchema }) } },
        description: "Permission updated",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Permission not found",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");

    const [existing] = await db
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.id, id))
      .limit(1);

    if (!existing) return c.json({ error: "Permission not found." }, 404 as const);

    const [updated] = await db
      .update(permissions)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(permissions.id, id))
      .returning();

    return c.json({ data: updated }, 200 as const);
  },
);

// ─── Soft delete permission ────────────────────────────────────────────────────
// Sets isActive = false rather than hard-deleting.
// Existing org assignments remain in the DB for auditability.
router.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    tags: ["Permissions"],
    summary: "Deactivate a permission (soft delete)",
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        content: { "application/json": { schema: successSchema } },
        description: "Permission deactivated",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Permission not found",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const { id } = c.req.valid("param");

    const [existing] = await db
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.id, id))
      .limit(1);

    if (!existing) return c.json({ error: "Permission not found." }, 404 as const);

    await db
      .update(permissions)
      .set({ isActive: false, updatedAt: new Date().toISOString() })
      .where(eq(permissions.id, id));

    return c.json({ success: true }, 200 as const);
  },
);

export default router;
