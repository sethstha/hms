export type SessionState<T> = {
  readonly data: T | null;
  readonly loading: boolean;
  refresh: () => Promise<void>;
};

/**
 * Creates a reactive session state using Svelte 5 runes.
 * Calls getSession immediately on creation (auto-init) so the session
 * is available as soon as the enclosing component/layout mounts.
 */
export function createSession<T>(
  getSession: () => Promise<{ data: T | null; error: unknown }>,
): SessionState<T> {
  let data = $state<T | null>(null);
  let loading = $state(true);

  const refresh = async () => {
    loading = true;
    const result = await getSession();
    data = result.data;
    loading = false;
  };

  // Auto-init: fire immediately, caller does not need to call refresh() manually.
  refresh();

  return {
    get data() {
      return data;
    },
    get loading() {
      return loading;
    },
    refresh,
  };
}

// ─── Server-side session helpers ────────────────────────────────────────────────

export type TenantContext = {
  id: string;
  organizationId: string | null;
};

/**
 * Fetches a session from the API server on behalf of a SvelteKit request.
 * Used in hooks.server.ts — forwards the request cookie to the API.
 */
export const fetchSession = async <T>(
  request: Request,
  apiUrl: string,
  basePath: "/auth/admin" | "/auth/hospital",
): Promise<T | null> => {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;

  const response = await fetch(`${apiUrl}${basePath}/get-session`, {
    method: "GET",
    headers: { cookie, accept: "application/json" },
  }).catch(() => null);

  if (!response?.ok) return null;

  const payload = await response.json().catch(() => null);
  if (!payload || typeof payload !== "object") return null;

  return payload as T;
};

/**
 * Extracts tenant context (tenantId + organizationId) from a raw session object.
 */
export const readTenant = (session: unknown): TenantContext | null => {
  const user = (session as Record<string, unknown> | null)?.user as
    | Record<string, unknown>
    | undefined;
  if (!user) return null;

  const tenantId =
    typeof user.tenantId === "string" && user.tenantId.length > 0 ? user.tenantId : null;
  if (!tenantId) return null;

  const organizationId =
    typeof user.organizationId === "string" && user.organizationId.length > 0
      ? user.organizationId
      : null;

  return { id: tenantId, organizationId };
};
