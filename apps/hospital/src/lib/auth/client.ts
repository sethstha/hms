import { env } from '$env/dynamic/public'
import { createAuthClient } from 'better-auth/svelte'

const publicApiUrl = (env.PUBLIC_API_URL ?? '').trim()
const apiBaseUrl = publicApiUrl.length > 0 ? publicApiUrl : undefined

export const authClient = createAuthClient({
  baseURL: apiBaseUrl,
  basePath: '/api/v1/auth',
})

export type AppSession = typeof authClient.$Infer.Session
