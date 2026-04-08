import { dehydrate } from "@tanstack/svelte-query";
import { createQueryClient } from "$lib/query/client";
import { api } from "$lib/api/index";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ request }) => {
  const queryClient = createQueryClient();
  const cookie = request.headers.get("cookie") ?? "";

  await queryClient.prefetchQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await api.organizations.$get({}, { headers: { cookie } });
      if (!res.ok) throw new Error("Failed to fetch organizations");
      return res.json();
    },
  });

  return { dehydratedState: dehydrate(queryClient) };
};
