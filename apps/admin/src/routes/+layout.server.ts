import { dehydrate } from "@tanstack/svelte-query";
import { createQueryClient } from "$lib/query/client";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const queryClient = createQueryClient();
  return {
    session: locals.session,
    // Empty dehydrated state at the root — individual +page.server.ts files
    // prefetch their own data and pass their own dehydratedState as page data.
    dehydratedState: dehydrate(queryClient),
  };
};
