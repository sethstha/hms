import { AUTH_BASE_PATHS, type AuthApp } from "./paths.js";

export type SessionState<T> = {
  readonly data: T | null;
  readonly loading: boolean;
  refresh: () => Promise<void>;
};

/**
 * Creates a reactive session state using Svelte 5 runes.
 * Accepts optional `initialData` from SSR — when provided, `loading` starts
 * as `false` and `data` is pre-populated, eliminating the loading flash.
 * re-sync after client-side auth actions.
 */
export function createSession<T>(
  getSession: () => Promise<{ data: T | null; error: unknown }>,
  initialData?: T | null,
): SessionState<T> {
  let data = $state<T | null>(initialData ?? null);
  let loading = $state(initialData === undefined);

  const refresh = async () => {
    loading = true;
    const result = await getSession();
    data = result.data;
    loading = false;
  };

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

/**
 * Fetches a session from the API server on behalf of a SvelteKit request.
 * Used in hooks.server.ts — forwards the request cookie to the API.
 */
export const fetchSession = async <T>(
  request: Request,
  apiUrl: string,
  app: AuthApp,
): Promise<T | null> => {
  const basePath = AUTH_BASE_PATHS[app];
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
