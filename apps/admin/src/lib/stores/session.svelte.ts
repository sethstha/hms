// Session store for the admin app using Svelte 5 runes
// TODO: Populate from BetterAuth session after auth is configured
// Admin sessions are for internal platform users, not hospital staff

type AdminUser = {
  id: string
  email: string
  name: string
  role: string
}

type SessionState = {
  user: AdminUser | null
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
    setUser(user: AdminUser | null) { state.user = user },
    setLoading(loading: boolean) { state.isLoading = loading },
    clear() { state.user = null },
  }
}

export const session = createSession()
