<script lang="ts">
  import type { OrgPermission, Permission } from "@hms/schemas";
  import { Button, Skeleton, Table } from "@hms/ui";
  import { adminRoutes } from "@hms/utils";
  import { createQuery } from "@tanstack/svelte-query";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { api } from "$lib/api/index";
  import PermissionsForm from "./PermissionsForm.svelte";

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

  const orgId = $derived(org?.id ?? "");

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

  const grantsMap = $derived(
    new Map<string, OrgPermission>(
      (($orgPermissionsQuery.data as { data: OrgPermission[] } | undefined)?.data ?? []).map(
        (p) => [p.permissionId, p],
      ),
    ),
  );

  const isLoading = $derived(
    $catalogQuery.isPending || $orgsQuery.isPending || (!!orgId && $orgPermissionsQuery.isPending),
  );

  const isError = $derived(
    $catalogQuery.isError || $orgsQuery.isError || $orgPermissionsQuery.isError,
  );

  const isReady = $derived(!isLoading && !isError && !!orgId && catalog.length > 0);
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
    <h1 class="text-2xl font-semibold tracking-tight text-foreground">
      {org ? `Permissions: ${org.name}` : "Permissions"}
    </h1>
    <p class="mt-1 text-sm text-muted-foreground">
      Control which features and operations this organization can access.
    </p>
  </div>

  {#if isLoading}
    <!-- Skeleton table while queries resolve -->
    <div class="rounded-lg border bg-card">
      <Table.Root>
        <Table.Header>
          <Table.Row class="hover:bg-transparent">
            <Table.Head class="w-48">Permission</Table.Head>
            <Table.Head class="w-24 text-center">Create</Table.Head>
            <Table.Head class="w-24 text-center">Read</Table.Head>
            <Table.Head class="w-24 text-center">Update</Table.Head>
            <Table.Head class="w-24 text-center">Delete</Table.Head>
            <Table.Head></Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each { length: 5 } as _}
            <Table.Row>
              <Table.Cell><Skeleton class="h-4 w-32" /></Table.Cell>
              {#each { length: 4 } as _}
                <Table.Cell class="text-center">
                  <div class="flex justify-center">
                    <Skeleton class="h-4 w-4 rounded" />
                  </div>
                </Table.Cell>
              {/each}
              <Table.Cell></Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  {:else if isError}
    <div
      class="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      Failed to load permissions. Please refresh.
    </div>
  {:else if catalog.length === 0}
    <div class="rounded-md border border-muted px-4 py-6 text-center text-sm text-muted-foreground">
      No permissions in the catalog yet.
      <a href={adminRoutes.permissions.new} class="ml-1 underline underline-offset-4">Add one.</a>
    </div>
  {:else if isReady}
    <!-- Form only mounts after all data is available — createForm gets real defaultValues -->
    {#key orgId}
      <PermissionsForm {catalog} {grantsMap} {orgId} slug={page.params.slug} />
    {/key}
  {/if}
</div>
