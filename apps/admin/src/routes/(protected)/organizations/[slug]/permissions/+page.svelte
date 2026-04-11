<script lang="ts">
  // SPA mode: use URL params directly, never rely on SSR-loaded ids
  import type { OrgPermission, Permission } from "@hms/schemas";
  import { Badge, Button, Checkbox, Table } from "@hms/ui";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { api } from "$lib/api/index";
  import { adminRoutes } from "@hms/utils";

  const queryClient = useQueryClient();

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
      const res = await api.organizations.$get();
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

  const org = $derived(
    (($orgsQuery.data as { data: Organization[] } | undefined)?.data ?? []).find(
      (o) => o.slug === page.params.slug,
    ),
  );

  // Derived UUID id — only available after orgsQuery resolves
  const orgId = $derived(org?.id ?? "");

  // Org-specific grants — gated on orgId being resolved
  const orgPermissionsQuery = createQuery({
    queryKey: ["org-permissions", page.params.slug],
    queryFn: async () => {
      const res = await api.organizations[":id"].permissions.$get({ param: { id: orgId } });
      if (!res.ok) throw new Error("Failed to fetch org permissions");
      return res.json();
    },
    enabled: !!orgId,
  });

  const catalog = $derived(($catalogQuery.data as { data: Permission[] } | undefined)?.data ?? []);

  // Key org permissions by permissionId for O(1) lookup
  const grantsMap = $derived(
    new Map<string, OrgPermission>(
      (($orgPermissionsQuery.data as { data: OrgPermission[] } | undefined)?.data ?? []).map(
        (p) => [p.permissionId, p],
      ),
    ),
  );

  // ─── Draft state — local edits before explicit save ──────────────────────────
  type PermFields = {
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };

  let draftState = $state<Record<string, PermFields>>({});

  // Sync draft from server whenever grantsMap changes (initial load + after mutations)
  $effect(() => {
    const next: Record<string, PermFields> = {};
    for (const [id, grant] of grantsMap) {
      next[id] = {
        canCreate: grant.canCreate,
        canRead: grant.canRead,
        canUpdate: grant.canUpdate,
        canDelete: grant.canDelete,
      };
    }
    draftState = next;
  });

  // Which rows have unsaved changes vs. server state
  const dirtySet = $derived(
    new Set(
      catalog
        .filter((p) => {
          const draft = draftState[p.id];
          const original = grantsMap.get(p.id);
          if (!draft || !original) return false;
          return (
            draft.canCreate !== original.canCreate ||
            draft.canRead !== original.canRead ||
            draft.canUpdate !== original.canUpdate ||
            draft.canDelete !== original.canDelete
          );
        })
        .map((p) => p.id),
    ),
  );

  // ─── Mutation state ───────────────────────────────────────────────────────────
  let pendingId = $state<string | null>(null);
  let mutationError = $state("");

  async function handleUpdate(permissionId: string) {
    const draft = draftState[permissionId];
    if (!draft) return;
    pendingId = permissionId;
    mutationError = "";
    try {
      const res = await api.organizations[":id"].permissions[":permissionId"].$put({
        param: { id: orgId, permissionId },
        json: draft,
      });
      if (!res.ok) throw new Error("Failed to update permission");
      await queryClient.invalidateQueries({ queryKey: ["org-permissions", orgId] });
    } catch (e) {
      mutationError = e instanceof Error ? e.message : "Something went wrong";
    } finally {
      pendingId = null;
    }
  }

  async function handleGrant(permissionId: string) {
    pendingId = permissionId;
    mutationError = "";
    try {
      const res = await api.organizations[":id"].permissions.$post({
        param: { id: orgId },
        json: { permissionId },
      });
      if (!res.ok) throw new Error("Failed to grant permission");
      await queryClient.invalidateQueries({ queryKey: ["org-permissions", orgId] });
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
      const res = await api.organizations[":id"].permissions[":permissionId"].$delete({
        param: { id: orgId, permissionId },
      });
      if (!res.ok) throw new Error("Failed to revoke permission");
      await queryClient.invalidateQueries({ queryKey: ["org-permissions", orgId] });
    } catch (e) {
      mutationError = e instanceof Error ? e.message : "Something went wrong";
    } finally {
      pendingId = null;
    }
  }

  const isLoading = $derived($catalogQuery.isPending || $orgPermissionsQuery.isPending);
  const isError = $derived($catalogQuery.isError || $orgPermissionsQuery.isError);
</script>

<div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="sm" onclick={() => goto(adminRoutes.organizations.root)}>
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

    <div>
      <h1 class="text-foreground text-2xl font-semibold tracking-tight">
        {org ? `Permissions: ${org.name}` : "Permissions"}
      </h1>
      <p class="text-muted-foreground mt-1 text-sm">
        Control which features and operations this organization can access.
      </p>
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
        <a href={adminRoutes.permissions.new} class="ml-1 underline underline-offset-4">Add one.</a>
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
              {@const granted = grantsMap.get(permission.id)}
              {@const isPending = pendingId === permission.id}
              <Table.Row class={isPending ? "opacity-60" : ""}>
                <Table.Cell>
                  <div class="font-medium">{permission.name}</div>
                  {#if permission.description}
                    <div class="text-muted-foreground text-xs">{permission.description}</div>
                  {/if}
                </Table.Cell>

                {#each ["canCreate", "canRead", "canUpdate", "canDelete"] as field}
                  {@const f = field as keyof PermFields}
                  <Table.Cell class="text-center">
                    <div class="flex justify-center">
                      <Checkbox
                        checked={draftState[permission.id]?.[f] ?? false}
                        disabled={!granted || isPending}
                        onCheckedChange={(v) => {
                          if (draftState[permission.id]) {
                            draftState[permission.id][f] = v === true;
                          }
                        }}
                      />
                    </div>
                  </Table.Cell>
                {/each}

                <Table.Cell class="text-right">
                  {@const isDirty = dirtySet.has(permission.id)}
                  <div class="flex justify-end gap-2">
                    {#if granted}
                      {#if !isDirty}
                        <Badge
                          class="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        >
                          Granted
                        </Badge>
                      {/if}
                      <Button
                        size="sm"
                        variant="default"
                        disabled={isPending || !isDirty}
                        onclick={() => handleUpdate(permission.id)}
                      >
                        {isPending ? "Saving…" : "Update"}
                      </Button>
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
