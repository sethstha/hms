<script lang="ts">
  import { setContext } from "svelte";
  import { page } from "$app/state";
  import { locales, localizeHref } from "$lib/paraglide/runtime";
  import "./layout.css";
  import { Button } from "@hms/ui";
  import favicon from "$lib/assets/favicon.svg";
  import { authClient } from "$lib/auth/client";
  import { createSession } from "@hms/auth/session";

  let { children } = $props();

  const session = createSession(() => authClient.getSession());
  setContext("session", session);
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Admin Dashboard</title>
</svelte:head>
{@render children()}

<div style="display:none">
  {#each locales as locale}
    <a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
  {/each}
</div>
<Button></Button>
