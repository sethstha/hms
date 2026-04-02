import { createMiddleware } from 'hono/factory'

// TODO: Implement BetterAuth session validation
// TODO: Extract user session from Authorization header or cookie
// TODO: Attach verified user to context (c.set('user', ...))

export const authMiddleware = createMiddleware(async (c, next) => {
  await next()
})
