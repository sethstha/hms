import { ofetch } from 'ofetch'
import { env } from '$env/dynamic/public'

// TODO: Add admin auth token injection (platform-level token, not tenant token)
// TODO: Add global error handling (401 → redirect to login, 403 → show error)

const publicApiUrl = (env.PUBLIC_API_URL ?? '').trim()
const apiBaseUrl = publicApiUrl.length > 0 ? `${publicApiUrl}/api/v1` : '/api/v1'

export const api = ofetch.create({
  baseURL: apiBaseUrl,
  credentials: 'include',
})
