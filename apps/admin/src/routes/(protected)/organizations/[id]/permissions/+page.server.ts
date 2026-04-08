import { dehydrate } from "@tanstack/svelte-query";
import { createQueryClient } from "$lib/query/client";
import { api } from "$lib/api/index";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, request }) => {
  const queryClient = createQueryClient();
  const cookie = request.headers.get("cookie") ?? "";

  await Promise.all([
    // Global catalog — provides the full list of available permissions
    queryClient.prefetchQuery({
      queryKey: ["permissions"],
      queryFn: async () => {
        const res = await api.permissions.$get({}, { headers: { cookie } });
        if (!res.ok) throw new Error("Failed to fetch permissions");
        return res.json();
      },
    }),
    // Org-specific grants — which permissions this org currently has
    queryClient.prefetchQuery({
      queryKey: ["org-permissions", params.id],
      queryFn: async () => {
        const res = await api.organizations[":id"].permissions.$get(
          { param: { id: params.id } },
          { headers: { cookie } },
        );
        if (!res.ok) throw new Error("Failed to fetch org permissions");
        return res.json();
      },
    }),
    // Org details — for the page header
    queryClient.prefetchQuery({
      queryKey: ["organizations"],
      queryFn: async () => {
        const res = await api.organizations.$get({}, { headers: { cookie } });
        if (!res.ok) throw new Error("Failed to fetch organizations");
        return res.json();
      },
    }),
  ]);

  return { id: params.id, dehydratedState: dehydrate(queryClient) };
};
