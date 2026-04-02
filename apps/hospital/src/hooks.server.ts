import type { Handle } from '@sveltejs/kit'

// TODO: Add BetterAuth session handling
// import { auth } from '$lib/server/auth'

// TODO: Add tenant resolution from subdomain or X-Tenant-ID header
// The resolved tenant should be attached to event.locals.tenant

// TODO: Add Paraglide language handling
// import { i18n } from '$lib/i18n'

export const handle: Handle = async ({ event, resolve }) => {
  // Placeholder — middleware will be chained here using sequence()
  return resolve(event)
}
