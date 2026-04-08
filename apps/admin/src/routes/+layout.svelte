<script lang="ts">
  import { page } from "$app/state";
  import { locales, localizeHref } from "$lib/paraglide/runtime";
  import { setContext, type Snippet } from "svelte";
  import "./layout.css";
  import { createSession } from "@hms/auth/session";
  import { Button } from "@hms/ui";
  import { HydrationBoundary, QueryClientProvider } from "@tanstack/svelte-query";
  import favicon from "$lib/assets/favicon.svg";
  import { authClient } from "$lib/auth/client";
  import { createQueryClient } from "$lib/query/client";
  import type { LayoutData } from "./$types";

  let { children, data }: { children: Snippet; data: LayoutData } = $props();

  const session = createSession(() => authClient.getSession(), data.session);
  setContext("session", session);

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
