import { Hono } from 'hono'

import { createBetterAuth } from '@hms/auth/server'
import type { AppEnv } from '@hms/api/types'

const router = new Hono<AppEnv>()

const getTrustedOrigins = (rawTrustedOrigins: string | undefined): string[] => {
  if (!rawTrustedOrigins) {
    return []
  }

  return rawTrustedOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
}

router.all('*', async (c) => {
  const databaseUrl = c.env.DATABASE_URL

  if (!databaseUrl) {
    return c.json(
      { error: 'DATABASE_URL is missing. Better Auth requires a database connection.' },
      500,
    )
  }

  const secret = c.env.BETTER_AUTH_SECRET ?? 'better-auth-dev-secret-change-me'

  const baseURL = c.env.BETTER_AUTH_URL ?? new URL(c.req.url).origin
  const trustedOrigins = getTrustedOrigins(c.env.BETTER_AUTH_TRUSTED_ORIGINS)
  const auth = createBetterAuth({
    databaseUrl,
    baseURL,
    secret,
    trustedOrigins,
  })

  return auth.handler(c.req.raw)
})

export default router
