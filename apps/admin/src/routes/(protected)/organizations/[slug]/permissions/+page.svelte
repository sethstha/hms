<script lang="ts">
  import type { OrgPermission, Permission } from "@hms/schemas";
  import { Badge, Button, Checkbox, Table } from "@hms/ui";
  import { createQuery, HydrationBoundary, useQueryClient } from "@tanstack/svelte-query";
  import { goto } from "$app/navigation";
  import { organizationsApi } from "$lib/api";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const queryClient = useQueryClient();
  const { slug: orgSlug } = data;

  type Organization = {
    id: string;
    name: string;
    slug: string;
    domain: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };

  const orgsQuery = createQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await organizationsApi.();
      if (!res.ok) throw new Error("Failed to fetch organizations");
      return res.json();
    },
  });

  // Global permission catalog — source of truth for what to display
  const catalogQuery = createQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await api.permissions.$get();
      if (!res.ok) throw new Error("Failed to fetch permissions");
      return res.json();
    },
  });

  // Org-specific grants
  const orgPermissionsQuery = createQuery({
    queryKey: ["org-permissions", orgSlug],
    queryFn: async () => {
      const res = await organizationsApi[":slug"].permissions.$get({ param: { slug: orgSlug } });
      if (!res.ok) throw new Error("Failed to fetch org permissions");
      return res.json();
    },
  });

  const org = $derived(
    (($orgsQuery.data as { data: Organization[] } | undefined)?.data ?? []).find(
      (o) => o.slug === orgSlug,
    ),
  );

  const catalog = $derived(($catalogQuery.data as { data: Permission[] } | undefined)?.data ?? []);

  // Key org permissions by permissionId for O(1) lookup
  const grantsMap = $derived(
    new Map<string, OrgPermission>(
      (($orgPermissionsQuery.data as { data: OrgPermission[] } | undefined)?.data ?? []).map(
        (p) => [p.permissionId, p],
      ),
    ),
  );

  // ─── Mutation state ───────────────────────────────────────────────────────────
  let pendingId = $state<string | null>(null);
  let isSaving = $state(false);
  let mutationError = $state("");

  type CrudFlags = Pick<OrgPermission, "canCreate" | "canRead" | "canUpdate" | "canDelete">;

  // Local edits accumulate here until the user clicks Save
  let localOverrides = $state(new Map<string, CrudFlags>());

  const isDirty = $derived(localOverrides.size > 0);

  function effectiveGrant(permissionId: string): OrgPermission | undefined {
    const server = grantsMap.get(permissionId);
    if (!server) return undefined;
    const override = localOverrides.get(permissionId);
    return override ? { ...server, ...override } : server;
  }

  function handleLocalToggle(permissionId: string, field: keyof CrudFlags, value: boolean) {
    const server = grantsMap.get(permissionId)!;
    const current = localOverrides.get(permissionId) ?? {
      canCreate: server.canCreate,
      canRead: server.canRead,
      canUpdate: server.canUpdate,
      canDelete: server.canDelete,
    };
    localOverrides = new Map(localOverrides).set(permissionId, { ...current, [field]: value });
  }

  async function handleSave() {
    isSaving = true;
    mutationError = "";
    try {
      for (const [permissionId, flags] of localOverrides) {
        const res = await organizationsApi[":slug"].permissions[":permissionId"].$put({
          param: { slug: orgSlug, permissionId },
          json: flags,
        });
        if (!res.ok) throw new Error(`Failed to update permission ${permissionId}`);
      }
      localOverrides = new Map();
      await queryClient.invalidateQueries({ queryKey: ["org-permissions", orgSlug] });
    } catch (e) {
      mutationError = e instanceof Error ? e.message : "Something went wrong";
    } finally {
      isSaving = false;
    }
  }

  async function handleGrant(permissionId: string) {
    pendingId = permissionId;
    mutationError = "";
    try {
      const res = await organizationsApi[":slug"].permissions.$post({
        param: { slug: orgSlug },
        json: { permissionId },
      });
      if (!res.ok) throw new Error("Failed to grant permission");
      await queryClient.invalidateQueries({ queryKey: ["org-permissions", orgSlug] });
    } catch (e) {
      mutationError = e instanceof Error ? e.message : "Something went wrong";
    } finally {
      pendingId = null;
    }
  }

  async function handleRevoke(permissionId: string) {
    pendingId = permissionId;
    mutationError = "";
    try {
      const res = await organizationsApi[":slug"].permissions[":permissionId"].$delete({
        param: { slug: orgSlug, permissionId },
      });
      if (!res.ok) throw new Error("Failed to revoke permission");
      await queryClient.invalidateQueries({ queryKey: ["org-permissions", orgSlug] });
    } catch (e) {
      mutationError = e instanceof Error ? e.message : "Something went wrong";
    } finally {
      pendingId = null;
    }
  }

  const isLoading = $derived($catalogQuery.isPending || $orgPermissionsQuery.isPending);
  const isError = $derived($catalogQuery.isError || $orgPermissionsQuery.isError);
</script>

<HydrationBoundary state={data.dehydratedState}>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="sm" onclick={() => goto("/organizations")}>
        <svg
          class="mr-1 h-4 w-4"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Organizations
      </Button>
    </div>

    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-foreground text-2xl font-semibold tracking-tight">
          {org ? `Permissions: ${org.name}` : "Permissions"}
        </h1>
        <p class="text-muted-foreground mt-1 text-sm">
          Control which features and operations this organization can access.
        </p>
      </div>
      {#if isDirty}
        <Button onclick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
      {/if}
    </div>

    {#if mutationError}
      <div
        class="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
      >
        {mutationError}
      </div>
    {/if}

    {#if isLoading}
      <div class="text-muted-foreground flex h-40 items-center justify-center text-sm">
        Loading…
      </div>
    {:else if isError}
      <div
        class="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
      >
        Failed to load permissions. Please refresh.
      </div>
    {:else if catalog.length === 0}
      <div
        class="border-muted text-muted-foreground rounded-md border px-4 py-6 text-center text-sm"
      >
        No permissions in the catalog yet.
        <a href="/permissions/new" class="ml-1 underline underline-offset-4">Add one.</a>
      </div>
    {:else}
      <div class="bg-card rounded-lg border">
        <Table.Root>
          <Table.Header>
            <Table.Row class="hover:bg-transparent">
              <Table.Head class="w-40">Permission</Table.Head>
              <Table.Head class="w-24 text-center">Create</Table.Head>
              <Table.Head class="w-24 text-center">Read</Table.Head>
              <Table.Head class="w-24 text-center">Update</Table.Head>
              <Table.Head class="w-24 text-center">Delete</Table.Head>
              <Table.Head class="text-right">Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each catalog as permission}
              {@const granted = effectiveGrant(permission.id)}
              {@const isPending = pendingId === permission.id}
              {@const hasLocalChange = localOverrides.has(permission.id)}
              <Table.Row class={isPending ? "opacity-60" : ""}>
                <Table.Cell>
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{permission.name}</span>
                    {#if hasLocalChange}
                      <span class="h-1.5 w-1.5 rounded-full bg-amber-400" title="Unsaved changes"
                      ></span>
                    {/if}
                  </div>
                  {#if permission.description}
                    <div class="text-muted-foreground text-xs">{permission.description}</div>
                  {/if}
                </Table.Cell>

                {#each ["canCreate", "canRead", "canUpdate", "canDelete"] as field}
                  <Table.Cell class="text-center">
                    <div class="flex justify-center">
                      <Checkbox
                        checked={granted
                          ? (granted[field as keyof OrgPermission] as boolean)
                          : false}
                        disabled={!granted || isPending || isSaving}
                        onCheckedChange={(v) =>
                          handleLocalToggle(permission.id, field as keyof CrudFlags, v === true)}
                      />
                    </div>
                  </Table.Cell>
                {/each}

                <Table.Cell class="text-right">
                  <div class="flex justify-end gap-2">
                    {#if granted}
                      <Badge
                        class="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      >
                        Granted
                      </Badge>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isPending}
                        onclick={() => handleRevoke(permission.id)}
                      >
                        {isPending ? "Revoking…" : "Revoke"}
                      </Button>
                    {:else}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onclick={() => handleGrant(permission.id)}
                      >
                        {isPending ? "Granting…" : "Grant"}
                      </Button>
                    {/if}
                  </div>
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </div>
      <p class="text-muted-foreground text-xs">
        {grantsMap.size} of {catalog.length} permission{catalog.length !== 1 ? "s" : ""} granted
      </p>
    {/if}
  </div>
</HydrationBoundary>
