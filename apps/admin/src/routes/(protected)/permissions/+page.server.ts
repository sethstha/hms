import { dehydrate } from "@tanstack/svelte-query";
import { createQueryClient } from "$lib/query/client";
import { api } from "$lib/api/index";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ request }) => {
  const queryClient = createQueryClient();
  const cookie = request.headers.get("cookie") ?? "";

  await queryClient.prefetchQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await api.permissions.$get({}, { headers: { cookie } });
      if (!res.ok) throw new Error("Failed to fetch permissions");
      return res.json();
    },
  });

  return { dehydratedState: dehydrate(queryClient) };
};
