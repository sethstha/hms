// Session store using Svelte 5 runes
// TODO: Populate from BetterAuth session after auth is configured
// TODO: Type the user object from BetterAuth's user schema

type SessionUser = {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
}

type SessionState = {
  user: SessionUser | null
  isLoading: boolean
}

function createSession() {
  let state = $state<SessionState>({
    user: null,
    isLoading: true,
  })

  return {
    get user() { return state.user },
    get isLoading() { return state.isLoading },
    setUser(user: SessionUser | null) { state.user = user },
    setLoading(loading: boolean) { state.isLoading = loading },
    clear() { state.user = null },
  }
}

export const session = createSession()
