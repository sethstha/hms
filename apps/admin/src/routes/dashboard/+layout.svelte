<script lang="ts">
  import { getContext } from "svelte";
  import { goto } from "$app/navigation";
  import {
    Sidebar,
    Badge,
    Avatar,
    Separator,
    Tooltip,
    DropdownMenu,
  } from "@hms/ui";
  import { authClient } from "$lib/auth/client";
  import type { SessionState } from "@hms/auth/session";
  import type { AppSession } from "$lib/auth/client";

  let { children } = $props();

  const session = getContext<SessionState<AppSession>>("session");

  $effect(() => {
    if (!session.loading && !session.data) {
      goto("/login");
    }
  });

  async function signOut() {
    await authClient.signOut();
    await goto("/login");
  }

  const initials = $derived(
    session.data?.user.name
      ? session.data.user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "?",
  );

  type NavItem = {
    label: string;
    icon: string;
    href: string;
    badge?: string | number;
    active?: boolean;
  };

  type NavGroup = {
    title: string;
    items: NavItem[];
  };

  const navGroups: NavGroup[] = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", href: "/dashboard", active: true },
        { label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", href: "/dashboard/analytics" },
      ],
    },
    {
      title: "Organizations",
      items: [
        { label: "All Organizations", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", href: "/dashboard/organizations", badge: "12" },
        { label: "Add Organization", icon: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z", href: "/dashboard/organizations/new" },
      ],
    },
    {
      title: "Hospitals",
      items: [
        { label: "All Hospitals", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", href: "/dashboard/hospitals", badge: "34" },
        { label: "Active", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", href: "/dashboard/hospitals/active", badge: "31" },
        { label: "Inactive", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z", href: "/dashboard/hospitals/inactive", badge: "3" },
      ],
    },
    {
      title: "Users",
      items: [
        { label: "All Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", href: "/dashboard/users", badge: "248" },
        { label: "Admins", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", href: "/dashboard/users/admins" },
        { label: "Doctors", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", href: "/dashboard/users/doctors", badge: "89" },
        { label: "Staff", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", href: "/dashboard/users/staff" },
        { label: "Banned", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636", href: "/dashboard/users/banned", badge: "2" },
      ],
    },
    {
      title: "Clinical",
      items: [
        { label: "Patients", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", href: "/dashboard/patients", badge: "1.2k" },
        { label: "Appointments", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", href: "/dashboard/appointments", badge: "56" },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Audit Logs", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", href: "/dashboard/logs" },
        { label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", href: "/dashboard/settings" },
      ],
    },
  ];
</script>

{#if session.loading}
  <div class="flex min-h-screen items-center justify-center">
    <span class="text-muted-foreground text-sm">Loading…</span>
  </div>
{:else if session.data}
<Sidebar.Provider>
  <Sidebar.Root collapsible="icon">
    <!-- Header: Logo + App name -->
    <Sidebar.Header class="border-b border-sidebar-border px-4 py-3">
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
          <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div class="truncate group-data-[collapsible=icon]:hidden">
          <p class="truncate text-sm font-semibold leading-tight text-sidebar-foreground">HMS Admin</p>
          <p class="truncate text-xs text-sidebar-foreground/50">System Console</p>
        </div>
      </div>
    </Sidebar.Header>

    <!-- Main nav -->
    <Sidebar.Content class="overflow-x-hidden py-2">
      {#each navGroups as group}
        <Sidebar.Group>
          <Sidebar.GroupLabel class="px-4 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden">
            {group.title}
          </Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {#each group.items as item}
                <Sidebar.MenuItem>
                  <Tooltip.Provider delayDuration={0}>
                    <Tooltip.Root>
                      <Tooltip.Trigger>
                        {#snippet child({ props })}
                          <Sidebar.MenuButton
                            {...props}
                            isActive={item.active}
                            class="group/item relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground"
                          >
                            <svg
                              class="h-4 w-4 shrink-0 text-sidebar-foreground/60 group-hover/item:text-sidebar-accent-foreground data-[active=true]:text-sidebar-accent-foreground"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="1.5"
                              viewBox="0 0 24 24"
                            >
                              <path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
                            </svg>
                            <span class="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
                            {#if item.badge}
                              <span class="ml-auto shrink-0 rounded-full bg-sidebar-foreground/10 px-1.5 py-0.5 text-xs font-medium tabular-nums text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                                {item.badge}
                              </span>
                            {/if}
                          </Sidebar.MenuButton>
                        {/snippet}
                      </Tooltip.Trigger>
                      <Tooltip.Content side="right" class="hidden group-data-[collapsible=icon]:block">
                        {item.label}
                      </Tooltip.Content>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </Sidebar.MenuItem>
              {/each}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
        <Sidebar.Separator class="group-data-[collapsible=icon]:hidden" />
      {/each}
    </Sidebar.Content>

    <!-- Footer: User info -->
    <Sidebar.Footer class="border-t border-sidebar-border p-3">
      <div class="flex items-center gap-3 overflow-hidden rounded-md px-1 py-1">
        <Avatar.Root class="h-7 w-7 shrink-0">
          <Avatar.Fallback class="bg-blue-600 text-xs font-semibold text-white">{initials}</Avatar.Fallback>
        </Avatar.Root>
        <div class="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
          <p class="truncate text-sm font-medium text-sidebar-foreground">{session.data?.user.name ?? "—"}</p>
          <p class="truncate text-xs text-sidebar-foreground/50">{session.data?.user.email ?? ""}</p>
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger class="group-data-[collapsible=icon]:hidden shrink-0 rounded p-1 text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h.01M12 12h.01M19 12h.01" />
            </svg>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content side="top" align="end" class="w-44">
            <DropdownMenu.Item>Profile</DropdownMenu.Item>
            <DropdownMenu.Item>Preferences</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onclick={signOut} class="text-destructive">Sign out</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </Sidebar.Footer>

    <Sidebar.Rail />
  </Sidebar.Root>

  <!-- Main content area -->
  <Sidebar.Inset class="flex flex-col">
    <!-- Top bar -->
    <header class="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-5">
      <Sidebar.Trigger class="text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" class="h-5" />
      <div class="flex flex-1 items-center gap-2">
        <nav class="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Admin</span>
          <span>/</span>
          <span class="text-foreground font-medium">Dashboard</span>
        </nav>
      </div>
      <div class="flex items-center gap-2">
        <Badge class="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <span class="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
          System Online
        </Badge>
      </div>
    </header>

    <!-- Page content slot -->
    <main class="flex-1 overflow-auto p-6">
      {@render children()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
{/if}
