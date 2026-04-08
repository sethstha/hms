import { dehydrate } from "@tanstack/svelte-query";
import { createQueryClient } from "$lib/query/client";
import { api } from "$lib/api/index";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, request }) => {
  const queryClient = createQueryClient();
  const cookie = request.headers.get("cookie") ?? "";

  // Reuse the shared permissions list — the edit page derives the target from it.
  await queryClient.prefetchQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await api.permissions.$get({}, { headers: { cookie } });
      if (!res.ok) throw new Error("Failed to fetch permissions");
      return res.json();
    },
  });

  return { id: params.id, dehydratedState: dehydrate(queryClient) };
};
