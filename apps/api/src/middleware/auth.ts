import { createMiddleware } from 'hono/factory'

import { createBetterAuth } from '@hms/api/auth'
import type { AppEnv, AuthenticatedUser } from '@hms/api/types'

const toIsoString = (value: unknown): string => {
  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'string') {
    return value
  }

  return new Date().toISOString()
}

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const databaseUrl = c.env.DATABASE_URL
  const secret = c.env.BETTER_AUTH_SECRET ?? 'better-auth-dev-secret-change-me'

  if (!databaseUrl) {
    return c.json({ error: 'Auth is not configured. Missing DATABASE_URL.' }, 500)
  }

  const baseURL = c.env.BETTER_AUTH_URL ?? new URL(c.req.url).origin
  const trustedOrigins = (c.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)

  const auth = createBetterAuth({
    databaseUrl,
    baseURL,
    secret,
    trustedOrigins,
  })

  const currentSession = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!currentSession) {
    return c.json({ error: 'Unauthorized. Invalid or expired session.' }, 401)
  }

  const sessionUser = currentSession.user as Record<string, unknown>
  const role = typeof sessionUser.role === 'string' ? sessionUser.role : 'doctor'
  const tenantId = typeof sessionUser.tenantId === 'string' ? sessionUser.tenantId : null
  const organizationId =
    typeof sessionUser.organizationId === 'string' ? sessionUser.organizationId : null
  const isActive = typeof sessionUser.isActive === 'boolean' ? sessionUser.isActive : true

  c.set('session', {
    id: currentSession.session.id,
    userId: currentSession.session.userId,
    expiresAt: toIsoString(currentSession.session.expiresAt),
    revokedAt: null,
    createdAt: toIsoString(currentSession.session.createdAt),
    ipAddress: currentSession.session.ipAddress ?? null,
    userAgent: currentSession.session.userAgent ?? null,
  })

  c.set('user', {
    id: currentSession.user.id,
    email: currentSession.user.email,
    role: role as AuthenticatedUser['role'],
    tenantId,
    organizationId,
    isActive,
  })

  await next()
})
