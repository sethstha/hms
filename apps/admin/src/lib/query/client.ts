import { QueryClient } from "@tanstack/svelte-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Fail fast on the server — the client retries after hydration (default: 3).
        retry: false,
        // 30s default freshness window. Override per-query with queryOptions({ staleTime }).
        staleTime: 30_000,
      },
    },
  });
}
