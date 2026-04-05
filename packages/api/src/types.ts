import type { Db } from '@hms/db'
import type { Tenant, User, UserSession } from '@hms/db/schema'

export type AuthenticatedUser = Pick<
  User,
  'id' | 'email' | 'role' | 'tenantId' | 'organizationId' | 'isActive'
>

export type AuthenticatedSession = Pick<
  UserSession,
  'id' | 'userId' | 'expiresAt' | 'revokedAt' | 'createdAt' | 'ipAddress' | 'userAgent'
>

export type TenantContext = Pick<Tenant, 'id' | 'organizationId' | 'name' | 'slug' | 'isActive'> | null

export type AppBindings = {
  DATABASE_URL?: string
  BETTER_AUTH_SECRET?: string
  BETTER_AUTH_URL?: string
  BETTER_AUTH_TRUSTED_ORIGINS?: string
}

export type AppVariables = {
  db: Db
  user: AuthenticatedUser | null
  session: AuthenticatedSession | null
  tenant: TenantContext
}

export type AppEnv = {
  Bindings: AppBindings
  Variables: AppVariables
}
