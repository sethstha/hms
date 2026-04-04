import { ofetch } from 'ofetch'
import { env } from '$env/dynamic/public'

// TODO: Add auth token injection from session store
// TODO: Add tenant header injection (X-Tenant-ID)
// TODO: Add global error handling (401 → redirect to login, 403 → show error)

const publicApiUrl = (env.PUBLIC_API_URL ?? '').trim()
const apiBaseUrl = publicApiUrl.length > 0 ? `${publicApiUrl}/api/v1` : '/api/v1'

export const api = ofetch.create({
  baseURL: apiBaseUrl,
  credentials: 'include',
})
