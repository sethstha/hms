import { dehydrate } from "@tanstack/svelte-query";
import { createQueryClient } from "$lib/query/client";
import { api } from "$lib/api/index";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, request }) => {
  const queryClient = createQueryClient();
  const cookie = request.headers.get("cookie") ?? "";

  // Prefetch the list — the edit page derives the target org from it.
  // There is no single-org GET endpoint, so we reuse the list query
  // (already cached from the list page in most flows).
  await queryClient.prefetchQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await api.organizations.$get({}, { headers: { cookie } });
      if (!res.ok) throw new Error("Failed to fetch organizations");
      return res.json();
    },
  });

  return { id: params.id, dehydratedState: dehydrate(queryClient) };
};
