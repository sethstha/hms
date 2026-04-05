import { createMiddleware } from "hono/factory";

import type { AppEnv, AuthenticatedUser } from "./types";
import { createAdminAuth } from "./admin";
import { createHospitalAuth } from "./hospital";

// ─── Shared helpers ─────────────────────────────────────────────────────────────

const toIsoString = (value: unknown): string => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
};

const resolveEnv = (c: { env: AppEnv["Bindings"] }) => ({
  databaseUrl: c.env.DATABASE_URL ?? "",
  secret: c.env.BETTER_AUTH_SECRET ?? "better-auth-dev-secret-change-me",
  baseURL: c.env.BETTER_AUTH_URL ?? "",
  trustedOrigins: (c.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
});

// ─── Admin session middleware ────────────────────────────────────────────────────

/**
 * Validates a session via the admin better-auth instance (/auth/admin).
 * Sets c.var.user and c.var.session on success.
 */
export const requireAdminSession = createMiddleware<AppEnv>(async (c, next) => {
  const { databaseUrl, secret, baseURL, trustedOrigins } = resolveEnv(c);

  if (!databaseUrl) {
    return c.json({ error: "Auth not configured. Missing DATABASE_URL." }, 500);
  }

  const auth = createAdminAuth({ databaseUrl, baseURL, secret, trustedOrigins });
  const currentSession = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!currentSession) {
    return c.json({ error: "Unauthorized. Invalid or expired session." }, 401);
  }

  _setSessionVars(c, currentSession);
  await next();
});

// ─── Hospital session middleware ─────────────────────────────────────────────────

/**
 * Validates a session via the hospital better-auth instance (/auth/hospital).
 * Sets c.var.user and c.var.session on success.
 */
export const requireHospitalSession = createMiddleware<AppEnv>(async (c, next) => {
  const { databaseUrl, secret, baseURL, trustedOrigins } = resolveEnv(c);

  if (!databaseUrl) {
    return c.json({ error: "Auth not configured. Missing DATABASE_URL." }, 500);
  }

  const auth = createHospitalAuth({ databaseUrl, baseURL, secret, trustedOrigins });
  const currentSession = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!currentSession) {
    return c.json({ error: "Unauthorized. Invalid or expired session." }, 401);
  }

  _setSessionVars(c, currentSession);
  await next();
});

// ─── Role guard ─────────────────────────────────────────────────────────────────

/**
 * Restricts the route to users whose role is in the allowed list.
 * Must be placed after requireAdminSession or requireHospitalSession.
 */
export const requireRole = (...roles: AuthenticatedUser["role"][]) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized." }, 401);
    }
    if (!roles.includes(user.role)) {
      return c.json({ error: `Forbidden. Requires one of: ${roles.join(", ")}.` }, 403);
    }
    await next();
  });

// ─── Active user guard ───────────────────────────────────────────────────────────

/**
 * Rejects requests from banned/deactivated accounts.
 * Must be placed after requireAdminSession or requireHospitalSession.
 */
export const requireActiveUser = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized." }, 401);
  }
  if (!user.isActive) {
    return c.json({ error: "Forbidden. Your account has been deactivated." }, 403);
  }
  await next();
});

// ─── Internal helper ─────────────────────────────────────────────────────────────

function _setSessionVars(
  c: Parameters<Parameters<typeof createMiddleware<AppEnv>>[0]>[0],
  currentSession: { session: Record<string, unknown>; user: Record<string, unknown> },
) {
  const sessionUser = currentSession.user as Record<string, unknown>;

  c.set("session", {
    id: currentSession.session.id as string,
    userId: currentSession.session.userId as string,
    expiresAt: toIsoString(currentSession.session.expiresAt),
    revokedAt: null,
    createdAt: toIsoString(currentSession.session.createdAt),
    ipAddress: (currentSession.session.ipAddress as string | null) ?? null,
    userAgent: (currentSession.session.userAgent as string | null) ?? null,
  });

  c.set("user", {
    id: currentSession.user.id as string,
    email: currentSession.user.email as string,
    role: (typeof sessionUser.role === "string" ? sessionUser.role : "doctor") as AuthenticatedUser["role"],
    tenantId: typeof sessionUser.tenantId === "string" ? sessionUser.tenantId : null,
    organizationId: typeof sessionUser.organizationId === "string" ? sessionUser.organizationId : null,
    isActive: typeof sessionUser.isActive === "boolean" ? sessionUser.isActive : true,
  });
}
