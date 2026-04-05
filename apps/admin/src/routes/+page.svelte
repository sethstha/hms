<script lang="ts">
  import { getContext } from "svelte";
  import { goto } from "$app/navigation";
  import type { SessionState } from "@hms/auth/session";
  import type { AppSession } from "$lib/auth/client";

  const session = getContext<SessionState<AppSession>>("session");

  $effect(() => {
    if (!session.loading) {
      goto(session.data ? "/dashboard" : "/login");
    }
  });
</script>
