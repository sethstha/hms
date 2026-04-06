<script lang="ts">
  import { setContext } from "svelte";
  import { page } from "$app/state";
  import { locales, localizeHref } from "$lib/paraglide/runtime";
  import "./layout.css";
  import { Button } from "@hms/ui";
  import favicon from "$lib/assets/favicon.svg";
  import { authClient } from "$lib/auth/client";
  import { createSession } from "@hms/auth/session";
  import type { LayoutData } from "./$types";
  import { QueryClientProvider, HydrationBoundary } from "@tanstack/svelte-query";
  import { createQueryClient } from "$lib/query/client";

  let { children, data }: { children: Snippet; data: LayoutData } = $props();

  const session = createSession(() => authClient.getSession(), data.session);
  setContext("session", session);

  $effect(() => {
    session.refresh();
  });

  const queryClient = createQueryClient();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Admin Dashboard</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
  <HydrationBoundary state={data.dehydratedState}>
    {@render children()}
  </HydrationBoundary>
</QueryClientProvider>

<div style="display:none">
  {#each locales as locale}
    <a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
  {/each}
</div>
<Button></Button>
