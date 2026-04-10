<script lang="ts">
  import { Sidebar, Badge, Separator } from "@hms/ui";
  import AppSidebar from "$lib/components/AppSidebar.svelte";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { authClient } from "$lib/auth/client";
  import { adminRoutes } from "@hms/utils";

  let { children } = $props();
  let checked = $state(false);

  onMount(async () => {
    const { data } = await authClient.getSession();
    if (!data?.session) {
      goto(adminRoutes.login);
    } else {
      checked = true;
    }
  });

  const breadcrumb = $derived.by(() => {
    const parts = page.url.pathname.replace(/^\//, "").split("/");
    const segment = parts[0] ?? "dashboard";
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
  });
</script>

{#if checked}
<Sidebar.Provider>
  <AppSidebar />

  <Sidebar.Inset class="flex flex-col">
    <header class="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-5">
      <Sidebar.Trigger class="text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" class="h-5" />
      <div class="flex flex-1 items-center gap-2">
        <nav class="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Admin</span>
          <span>/</span>
          <span class="font-medium text-foreground">{breadcrumb}</span>
        </nav>
      </div>
      <div class="flex items-center gap-2">
        <Badge class="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <span class="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
          System Online
        </Badge>
      </div>
    </header>

    <main class="flex-1 overflow-auto p-6">
      {@render children()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
{/if}
