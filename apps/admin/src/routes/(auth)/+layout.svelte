<script lang="ts">
  import { getContext } from "svelte";
  import { goto } from "$app/navigation";
  import type { SessionState } from "@hms/auth/session";
  import type { AppSession } from "$lib/auth/client";

  let { children } = $props();

  const session = getContext<SessionState<AppSession>>("session");

  $effect(() => {
    if (!session.loading && session.data) {
      goto("/dashboard");
    }
  });
</script>

{#if !session.loading && !session.data}
  <div class="flex min-h-screen items-center justify-center bg-muted/40">
    {@render children()}
  </div>
{/if}
