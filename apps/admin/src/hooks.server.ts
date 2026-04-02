import type { Handle } from '@sveltejs/kit'

// TODO: Add BetterAuth session handling
// import { auth } from '$lib/server/auth'

// TODO: Add tenant resolution for internal admin (platform-level, not tenant-scoped)
// TODO: Add Paraglide language handling

export const handle: Handle = async ({ event, resolve }) => {
  // Placeholder — middleware will be chained here using sequence()
  return resolve(event)
}
