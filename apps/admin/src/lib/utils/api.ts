import { ofetch } from 'ofetch'

// TODO: Configure base URL from PUBLIC_API_URL environment variable
// TODO: Add admin auth token injection (platform-level token, not tenant token)
// TODO: Add global error handling (401 → redirect to login, 403 → show error)

export const api = ofetch.create({
  baseURL: '/api',
  // headers will be added here once auth is configured
})
