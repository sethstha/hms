<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { HydrationBoundary } from "@tanstack/svelte-query";
  import { Table, Badge, Button, Checkbox } from "@hms/ui";
  import { goto } from "$app/navigation";
  import { api } from "$lib/api/index";
  import type { Permission, OrgPermission } from "@hms/schemas";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const queryClient = useQueryClient();
  const { id: orgId } = data;

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

  // Org-specific grants
  const orgPermissionsQuery = createQuery({
    queryKey: ["org-permissions", orgId],
    queryFn: async () => {
      const res = await api.organizations[":id"].permissions.$get({ param: { id: orgId } });
      if (!res.ok) throw new Error("Failed to fetch org permissions");
      return res.json();
    },
  });

  const org = $derived(
    (($orgsQuery.data as { data: Organization[] } | undefined)?.data ?? []).find(
      (o) => o.id === orgId,
    ),
  );

  const catalog = $derived(
    ($catalogQuery.data as { data: Permission[] } | undefined)?.data ?? [],
  );

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
  let mutationError = $state("");

  async function handleToggle(
    permissionId: string,
    field: "canCreate" | "canRead" | "canUpdate" | "canDelete",
    value: boolean,
  ) {
    const current = grantsMap.get(permissionId)!;
    pendingId = permissionId;
    mutationError = "";
    try {
      const res = await api.organizations[":id"].permissions[":permissionId"].$put({
        param: { id: orgId, permissionId },
        json: {
          canCreate: field === "canCreate" ? value : current.canCreate,
          canRead: field === "canRead" ? value : current.canRead,
          canUpdate: field === "canUpdate" ? value : current.canUpdate,
          canDelete: field === "canDelete" ? value : current.canDelete,
        },
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

<HydrationBoundary state={data.dehydratedState}>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="sm" onclick={() => goto("/organizations")}>
        <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Organizations
      </Button>
    </div>

    <div>
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        {org ? `Permissions: ${org.name}` : "Permissions"}
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Control which features and operations this organization can access.
      </p>
    </div>

    {#if mutationError}
      <div class="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {mutationError}
      </div>
    {/if}

    {#if isLoading}
      <div class="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading…</div>
    {:else if isError}
      <div class="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Failed to load permissions. Please refresh.
      </div>
    {:else if catalog.length === 0}
      <div class="rounded-md border border-muted px-4 py-6 text-center text-sm text-muted-foreground">
        No permissions in the catalog yet.
        <a href="/permissions/new" class="ml-1 underline underline-offset-4">Add one.</a>
      </div>
    {:else}
      <div class="rounded-lg border bg-card">
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
                    <div class="text-xs text-muted-foreground">{permission.description}</div>
                  {/if}
                </Table.Cell>

                {#each ["canCreate", "canRead", "canUpdate", "canDelete"] as field}
                  <Table.Cell class="text-center">
                    <div class="flex justify-center">
                      <Checkbox
                        checked={granted ? (granted[field as keyof OrgPermission] as boolean) : false}
                        disabled={!granted || isPending}
                        onCheckedChange={(v) =>
                          handleToggle(
                            permission.id,
                            field as "canCreate" | "canRead" | "canUpdate" | "canDelete",
                            v === true,
                          )}
                      />
                    </div>
                  </Table.Cell>
                {/each}

                <Table.Cell class="text-right">
                  <div class="flex justify-end gap-2">
                    {#if granted}
                      <Badge class="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
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
      <p class="text-xs text-muted-foreground">
        {grantsMap.size} of {catalog.length} permission{catalog.length !== 1 ? "s" : ""} granted
      </p>
    {/if}
  </div>
</HydrationBoundary>
