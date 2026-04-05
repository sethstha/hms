<script lang="ts">
  import { getContext } from "svelte";
  import { goto } from "$app/navigation";
  import { readTenant } from "@hms/auth/session";
  import type { SessionState } from "@hms/auth/session";
  import type { AppSession } from "$lib/auth/client";

  let { children } = $props();

  const session = getContext<SessionState<AppSession>>("session");
  const tenant = $derived(session.data ? readTenant(session.data) : null);

  $effect(() => {
    if (!session.loading && (!session.data || !tenant)) {
      goto("/login");
    }
  });
</script>

{#if session.loading}
  <div class="flex min-h-screen items-center justify-center">
    <span class="text-muted-foreground text-sm">Loading…</span>
  </div>
{:else if session.data && tenant}
  <div class="flex min-h-screen">
    <main class="flex-1 p-6">
      {@render children()}
    </main>
  </div>
{/if}
