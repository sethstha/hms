<script lang="ts">
  import { setContext } from "svelte";
  import { page } from "$app/state";
  import { locales, localizeHref } from "$lib/paraglide/runtime";
  import "../app.css";
  import { Button } from "@hms/ui";
  import favicon from "$lib/assets/favicon.svg";
  import { authClient } from "$lib/auth/client";
  import { createSession } from "@hms/auth/session";
  import type { LayoutData } from "./$types";

  let { children, data }: { children: Snippet; data: LayoutData } = $props();

  const session = createSession(() => authClient.getSession(), data.session);
  setContext("session", session);

  $effect(() => {
    session.refresh();
  });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<div style="display:none">
  {#each locales as locale}
    <a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
  {/each}
  <Button>Hello</Button>
</div>
