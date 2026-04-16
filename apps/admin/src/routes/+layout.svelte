<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { dev } from "$app/environment";
  import { locales, localizeHref } from "$lib/paraglide/runtime";
  import { onMount, setContext, type Snippet } from "svelte";
  import "./layout.css";
  import { createSession } from "@hms/auth/session";
  import { adminRoutes } from "@hms/utils";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";
  import favicon from "$lib/assets/favicon.svg";
  import { authClient } from "$lib/auth/client";
  import { createQueryClient } from "$lib/query/client";

  let { children }: { children: Snippet } = $props();

  const session = createSession(() => authClient.getSession());
  setContext("session", session);

  onMount(async () => {
    if (page.url.pathname !== "/") return;
    const { data } = await authClient.getSession();
    goto(data?.session ? adminRoutes.dashboard : adminRoutes.login);
  });

  const queryClient = createQueryClient();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Admin Dashboard</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
  {@render children()}
  {#if dev}
    <SvelteQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
  {/if}
</QueryClientProvider>

<div style="display:none">
  {#each locales as locale}
    <a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
  {/each}
</div>
