import type { AppEnv } from "@hms/auth/types";
import {
  createOrganizationSchema,
  domainCheckSchema,
  errorSchema,
  grantFeatureSchema,
  RESERVED_SLUGS,
  slugCheckSchema,
  successSchema,
  updateOrganizationSchema,
} from "@hms/schemas";
import {
  organizationPermissions,
  organizations,
} from "@hms/db/schema";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "@hms/auth/middleware";

const router = new OpenAPIHono<AppEnv>();

const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  domain: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ─── Slug availability check (public — no auth) ────────────────────────────────
router.openapi(
  createRoute({
    method: "get",
    path: "/slug-check",
    tags: ["Organizations"],
    summary: "Check if a slug is available",
    request: {
      query: slugCheckSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              available: z.boolean(),
              reason: z.enum(["taken", "reserved"]).optional(),
            }),
          },
        },
        description: "Slug availability result",
      },
    },
  }),
  async (c) => {
    const { slug } = c.req.valid("query");

    if ((RESERVED_SLUGS as readonly string[]).includes(slug)) {
      return c.json({ available: false, reason: "reserved" as const }, 200 as const);
    }

    const db = c.get("db");
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    return c.json(
      existing ? { available: false, reason: "taken" as const } : { available: true },
      200 as const,
    );
  },
);

// ─── Domain availability check (public — no auth) ─────────────────────────────
router.openapi(
  createRoute({
    method: "get",
    path: "/domain-check",
    tags: ["Organizations"],
    summary: "Check if a custom domain is available",
    request: {
      query: domainCheckSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({ available: z.boolean() }),
          },
        },
        description: "Domain availability result",
      },
    },
  }),
  async (c) => {
    const { domain } = c.req.valid("query");
    const db = c.get("db");

    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.domain, domain))
      .limit(1);

    return c.json({ available: !existing }, 200 as const);
  },
);

// ─── All routes below require superadmin ──────────────────────────────────────
router.use("*", authMiddleware, requireRole("superadmin"));

// ─── List organizations ────────────────────────────────────────────────────────
router.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Organizations"],
    summary: "List all organizations",
    responses: {
      200: {
        content: {
          "application/json": { schema: z.object({ data: z.array(organizationSchema) }) },
        },
        description: "List of organizations",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const results = await db.select().from(organizations);
    return c.json({ data: results }, 200 as const);
  },
);

// ─── Create organization ───────────────────────────────────────────────────────
router.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Organizations"],
    summary: "Create an organization",
    request: {
      body: { content: { "application/json": { schema: createOrganizationSchema } } },
    },
    responses: {
      201: {
        content: { "application/json": { schema: z.object({ data: organizationSchema }) } },
        description: "Organization created",
      },
      409: {
        content: { "application/json": { schema: errorSchema } },
        description: "Slug or domain already taken",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const data = c.req.valid("json");

    if ((RESERVED_SLUGS as readonly string[]).includes(data.slug)) {
      return c.json({ error: "Slug is reserved." }, 409 as const);
    }

    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, data.slug))
      .limit(1);

    if (existing) {
      return c.json({ error: "Slug is already taken." }, 409 as const);
    }

    const [org] = await db
      .insert(organizations)
      .values({ ...data, isActive: true })
      .returning();

    return c.json({ data: org }, 201 as const);
  },
);

// ─── Update organization ───────────────────────────────────────────────────────
router.openapi(
  createRoute({
    method: "patch",
    path: "/{id}",
    tags: ["Organizations"],
    summary: "Update an organization",
    request: {
      params: z.object({ id: z.string() }),
      body: { content: { "application/json": { schema: updateOrganizationSchema } } },
    },
    responses: {
      200: {
        content: { "application/json": { schema: z.object({ data: organizationSchema }) } },
        description: "Organization updated",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Organization not found",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");

    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    if (!existing) return c.json({ error: "Organization not found." }, 404 as const);

    const [updated] = await db
      .update(organizations)
      .set(data)
      .where(eq(organizations.id, id))
      .returning();

    return c.json({ data: updated }, 200 as const);
  },
);

// ─── Grant feature ─────────────────────────────────────────────────────────────
router.openapi(
  createRoute({
    method: "post",
    path: "/{id}/permissions",
    tags: ["Organizations"],
    summary: "Grant a feature to an organization",
    request: {
      params: z.object({ id: z.string() }),
      body: { content: { "application/json": { schema: grantFeatureSchema } } },
    },
    responses: {
      201: {
        content: { "application/json": { schema: successSchema } },
        description: "Feature granted",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Organization not found",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const user = c.get("user")!;
    const { id } = c.req.valid("param");
    const { feature } = c.req.valid("json");

    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    if (!org) return c.json({ error: "Organization not found." }, 404 as const);

    // upsert — re-granting an existing feature is idempotent
    await db
      .insert(organizationPermissions)
      .values({ organizationId: id, feature, grantedBy: user.id })
      .onConflictDoNothing();

    return c.json({ success: true }, 201 as const);
  },
);

// ─── Revoke feature ────────────────────────────────────────────────────────────
router.openapi(
  createRoute({
    method: "delete",
    path: "/{id}/permissions/{feature}",
    tags: ["Organizations"],
    summary: "Revoke a feature from an organization",
    request: {
      params: z.object({ id: z.string(), feature: z.string() }),
    },
    responses: {
      200: {
        content: { "application/json": { schema: successSchema } },
        description: "Feature revoked",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Permission not found",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const { id, feature } = c.req.valid("param");

    const [existing] = await db
      .select({ id: organizationPermissions.id })
      .from(organizationPermissions)
      .where(
        and(
          eq(organizationPermissions.organizationId, id),
          eq(organizationPermissions.feature, feature as Parameters<typeof eq>[1]),
        ),
      )
      .limit(1);

    if (!existing) return c.json({ error: "Permission not found." }, 404 as const);

    await db
      .delete(organizationPermissions)
      .where(
        and(
          eq(organizationPermissions.organizationId, id),
          eq(organizationPermissions.feature, feature as Parameters<typeof eq>[1]),
        ),
      );

    return c.json({ success: true }, 200 as const);
  },
);

// ─── List permissions for an org ───────────────────────────────────────────────
router.openapi(
  createRoute({
    method: "get",
    path: "/{id}/permissions",
    tags: ["Organizations"],
    summary: "List features granted to an organization",
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({ data: z.array(z.object({ feature: z.string(), grantedAt: z.string() })) }),
          },
        },
        description: "List of granted features",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const { id } = c.req.valid("param");

    const results = await db
      .select({ feature: organizationPermissions.feature, grantedAt: organizationPermissions.grantedAt })
      .from(organizationPermissions)
      .where(eq(organizationPermissions.organizationId, id));

    return c.json({ data: results }, 200 as const);
  },
);

export default router;
