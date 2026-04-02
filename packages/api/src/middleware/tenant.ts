import { createMiddleware } from 'hono/factory'

// TODO: Resolve tenant from request subdomain or header (X-Tenant-ID)
// TODO: Validate tenant exists and is active in DB
// TODO: Attach tenant context (c.set('tenant', ...)) for RLS scoping

export const tenantMiddleware = createMiddleware(async (c, next) => {
  await next()
})
