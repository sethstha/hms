import { dehydrate } from "@tanstack/svelte-query";
import { createQueryClient } from "$lib/query/client";
import { api } from "$lib/api/index";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, request }) => {
  const queryClient = createQueryClient();
  const cookie = request.headers.get("cookie") ?? "";

  // Resolve slug → id before prefetching org-specific data.
  const orgsData = await queryClient.fetchQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await api.organizations.$get({}, { headers: { cookie } });
      if (!res.ok) throw new Error("Failed to fetch organizations");
      return res.json();
    },
  });

  const org = (orgsData as { data: { id: string; slug: string }[] }).data.find(
    (o) => o.slug === params.slug,
  );
  const orgId = org?.id ?? "";

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
      queryKey: ["org-permissions", orgId],
      queryFn: async () => {
        const res = await api.organizations[":id"].permissions.$get(
          { param: { id: orgId } },
          { headers: { cookie } },
        );
        if (!res.ok) throw new Error("Failed to fetch org permissions");
        return res.json();
      },
    }),
  ]);

  return { id: orgId, dehydratedState: dehydrate(queryClient) };
};
