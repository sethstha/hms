import { and, eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";

import { organizationPermissions, organizations, permissions, userMemberships } from "@hms/db/schema";
import type { AppEnv } from "@hms/auth/types";

export const orgMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized. User session is required." }, 401);
  }

  const requestedOrgId = c.req.header("x-org-id")?.trim() ?? null;
  const db = c.get("db");

  if (user.role === "superadmin") {
    if (!requestedOrgId) {
      c.set("organization", null);
      await next();
      return;
    }

    const [org] = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        isActive: organizations.isActive,
        domain: organizations.domain,
      })
      .from(organizations)
      .where(and(eq(organizations.id, requestedOrgId), eq(organizations.isActive, true)))
      .limit(1);

    if (!org) {
      return c.json({ error: "Organization not found or inactive." }, 404);
    }

    // superadmins operate platform-wide — no membership row required
    c.set("organization", { ...org, memberRole: "admin" as const });
    await next();
    return;
  }

  // Non-superadmin: must provide x-org-id and have an active membership
  if (!requestedOrgId) {
    return c.json({ error: "Forbidden. x-org-id header is required." }, 403);
  }

  const [membership] = await db
    .select({
      role: userMemberships.role,
      isActive: userMemberships.isActive,
    })
    .from(userMemberships)
    .where(
      and(
        eq(userMemberships.userId, user.id),
        eq(userMemberships.organizationId, requestedOrgId),
        eq(userMemberships.isActive, true),
      ),
    )
    .limit(1);

  if (!membership) {
    return c.json({ error: "Forbidden. No active membership in this organization." }, 403);
  }

  const [org] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      isActive: organizations.isActive,
      domain: organizations.domain,
    })
    .from(organizations)
    .where(and(eq(organizations.id, requestedOrgId), eq(organizations.isActive, true)))
    .limit(1);

  if (!org) {
    return c.json({ error: "Forbidden. Organization not found or inactive." }, 403);
  }

  c.set("organization", { ...org, memberRole: membership.role });
  await next();
});

// ─── Feature gate ─────────────────────────────────────────────────────────────

/**
 * Verifies that the current organization has been granted a specific permission (by slug).
 * Must be placed after orgMiddleware.
 *
 * Usage: router.use("*", authMiddleware, orgMiddleware, requireFeature("pharmacy"))
 */
export const requireFeature = (slug: string) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const org = c.get("organization");

    // superadmins bypass feature gates
    const user = c.get("user");
    if (user?.role === "superadmin") {
      await next();
      return;
    }

    if (!org) {
      return c.json({ error: "Forbidden. No organization context." }, 403);
    }

    const db = c.get("db");
    const [grant] = await db
      .select({ id: organizationPermissions.id })
      .from(organizationPermissions)
      .innerJoin(permissions, eq(permissions.id, organizationPermissions.permissionId))
      .where(
        and(
          eq(organizationPermissions.organizationId, org.id),
          eq(permissions.slug, slug),
          eq(permissions.isActive, true),
        ),
      )
      .limit(1);

    if (!grant) {
      return c.json(
        { error: `Forbidden. This organization does not have the '${slug}' feature enabled.` },
        403,
      );
    }

    await next();
  });
