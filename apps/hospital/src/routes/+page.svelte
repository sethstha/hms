<script lang="ts">
  import { getContext } from "svelte";
  import { goto } from "$app/navigation";
  import { readTenant } from "@hms/auth/session";
  import type { SessionState } from "@hms/auth/session";
  import type { AppSession } from "$lib/auth/client";

  const session = getContext<SessionState<AppSession>>("session");

  $effect(() => {
    if (!session.loading) {
      const hasAccess = session.data && readTenant(session.data);
      goto(hasAccess ? "/dashboard" : "/login");
    }
  });
</script>
