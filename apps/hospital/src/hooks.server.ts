import type { Handle } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import type { AppSession } from '$lib/auth/client'
import { paraglideMiddleware } from './paraglide/server.js'

const getApiBaseUrl = (): string => {
  const apiUrl = (env.API_URL ?? '').trim()
  return apiUrl.length > 0 ? apiUrl : 'http://localhost:8787'
}

const getSession = async (request: Request): Promise<AppSession | null> => {
  const cookie = request.headers.get('cookie')
  if (!cookie) {
    return null
  }

  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/get-session`, {
    method: 'GET',
    headers: {
      cookie,
      accept: 'application/json',
    },
  }).catch(() => null)

  if (!response || !response.ok) {
    return null
  }

  const payload = await response.json().catch(() => null)
  if (!payload || typeof payload !== 'object') {
    return null
  }

  return payload as AppSession
}

const readTenant = (session: AppSession | null): App.Locals['tenant'] => {
  const user = session?.user as Record<string, unknown> | undefined
  if (!user) {
    return null
  }

  const tenantId = typeof user.tenantId === 'string' && user.tenantId.length > 0 ? user.tenantId : null
  if (!tenantId) {
    return null
  }

  const organizationId =
    typeof user.organizationId === 'string' && user.organizationId.length > 0 ? user.organizationId : null

  return {
    id: tenantId,
    organizationId,
  }
}

export const handle: Handle = async ({ event, resolve }) => {
  const session = await getSession(event.request)
  event.locals.session = session
  event.locals.tenant = readTenant(session)

  return paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request
    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%lang%', locale),
    })
  })
}
