import { and, eq } from 'drizzle-orm'
import { createMiddleware } from 'hono/factory'

import { tenants } from '@hms/db/schema'
import type { AppEnv } from '@hms/auth/types'

export const tenantMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized. User session is required.' }, 401)
  }

  const requestedTenantId = c.req.header('x-tenant-id')?.trim() ?? null
  const db = c.get('db')

  if (user.role === 'superadmin') {
    if (!requestedTenantId) {
      c.set('tenant', null)
      await next()
      return
    }

    const [tenant] = await db
      .select({
        id: tenants.id,
        organizationId: tenants.organizationId,
        name: tenants.name,
        slug: tenants.slug,
        isActive: tenants.isActive,
      })
      .from(tenants)
      .where(and(eq(tenants.id, requestedTenantId), eq(tenants.isActive, true)))
      .limit(1)

    if (!tenant) {
      return c.json({ error: 'Tenant not found or inactive.' }, 404)
    }

    c.set('tenant', tenant)
    await next()
    return
  }

  if (!user.tenantId || !user.organizationId) {
    return c.json({ error: 'Forbidden. Non-superadmin user is missing tenant scope.' }, 403)
  }

  if (requestedTenantId && requestedTenantId !== user.tenantId) {
    return c.json({ error: 'Forbidden. Cross-tenant access is not allowed.' }, 403)
  }

  const [tenant] = await db
    .select({
      id: tenants.id,
      organizationId: tenants.organizationId,
      name: tenants.name,
      slug: tenants.slug,
      isActive: tenants.isActive,
    })
    .from(tenants)
    .where(and(eq(tenants.id, user.tenantId), eq(tenants.isActive, true)))
    .limit(1)

  if (!tenant) {
    return c.json({ error: 'Forbidden. Tenant not found or inactive.' }, 403)
  }

  if (tenant.organizationId !== user.organizationId) {
    return c.json({ error: 'Forbidden. Tenant-organization mismatch.' }, 403)
  }

  c.set('tenant', tenant)
  await next()
})
