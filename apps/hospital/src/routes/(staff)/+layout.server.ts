import type { LayoutServerLoad } from './$types'
// import { redirect } from '@sveltejs/kit'

// TODO: Protect staff routes — redirect to /login if session is missing
// TODO: Load tenant-scoped data needed by all staff pages

export const load: LayoutServerLoad = async ({ locals }) => {
  // const { session, tenant } = locals
  // if (!session) redirect(302, '/login')
  return {
    // session,
    // tenant,
  }
}
