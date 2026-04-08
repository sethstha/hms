<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { HydrationBoundary } from "@tanstack/svelte-query";
  import { DataTable, Table, Badge, Button, AlertDialog } from "@hms/ui";
  import { goto } from "$app/navigation";
  import { api } from "$lib/api/index";
  import type { PageData } from "./$types";
  import type { ColumnDef, SortingState } from "@hms/ui";

  let { data }: { data: PageData } = $props();

  type Organization = {
    id: string;
    name: string;
    slug: string;
    domain: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };

  const queryClient = useQueryClient();

  const orgsQuery = createQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await api.organizations.$get();
      if (!res.ok) throw new Error("Failed to fetch organizations");
      return res.json();
    },
  });

  // ─── Deactivate flow ─────────────────────────────────────────────────────────
  let deactivateTarget = $state<Organization | null>(null);
  let deactivateLoading = $state(false);
  let deactivateError = $state("");

  async function confirmDeactivate() {
    if (!deactivateTarget) return;
    deactivateLoading = true;
    deactivateError = "";
    try {
      const res = await api.organizations[":id"].$patch({
        param: { id: deactivateTarget.id },
        json: { isActive: false },
      });
      if (!res.ok) throw new Error("Failed to deactivate organization");
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      deactivateTarget = null;
    } catch (e) {
      deactivateError = e instanceof Error ? e.message : "Something went wrong";
    } finally {
      deactivateLoading = false;
    }
  }

  // ─── TanStack Table ──────────────────────────────────────────────────────────
  let sorting = $state<SortingState>([]);

  const columns: ColumnDef<Organization>[] = [
    { accessorKey: "name", header: "Name", cell: (info) => info.getValue() },
    { accessorKey: "slug", header: "Slug", cell: (info) => info.getValue() },
    {
      accessorKey: "domain",
      header: "Domain",
      cell: (info) => (info.getValue() as string | null) ?? "—",
    },
    { accessorKey: "isActive", header: "Status", enableSorting: true },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: (info) =>
        new Date(info.getValue() as string).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    { id: "actions", header: "", enableSorting: false },
  ];

  const orgs = $derived(($orgsQuery.data as { data: Organization[] } | undefined)?.data ?? []);

  const table = $derived(
    DataTable.createSvelteTable<Organization>({
      get data() { return orgs; },
      columns,
      state: { sorting },
      onSortingChange: (updater) => {
        sorting = typeof updater === "function" ? updater(sorting) : updater;
      },
      getCoreRowModel: DataTable.getCoreRowModel(),
      getSortedRowModel: DataTable.getSortedRowModel(),
    }),
  );
</script>

<HydrationBoundary state={data.dehydratedState}>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">Organizations</h1>
        <p class="mt-1 text-sm text-muted-foreground">All registered hospital groups on the platform.</p>
      </div>
      <Button onclick={() => goto("/organizations/new")}>
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Organization
      </Button>
    </div>

    {#if $orgsQuery.isPending}
      <div class="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading…</div>
    {:else if $orgsQuery.isError}
      <div class="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Failed to load organizations. Please refresh.
      </div>
    {:else}
      <div class="rounded-lg border bg-card">
        <Table.Root>
          <Table.Header>
            {#each table.getHeaderGroups() as headerGroup}
              <Table.Row class="hover:bg-transparent">
                {#each headerGroup.headers as header}
                  <Table.Head
                    class={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                    onclick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <DataTable.FlexRender content={header.column.columnDef.header} context={header.getContext()} />
                    {#if header.column.getIsSorted() === "asc"}
                      <span class="ml-1 text-xs">↑</span>
                    {:else if header.column.getIsSorted() === "desc"}
                      <span class="ml-1 text-xs">↓</span>
                    {/if}
                  </Table.Head>
                {/each}
              </Table.Row>
            {/each}
          </Table.Header>
          <Table.Body>
            {#if table.getRowModel().rows.length === 0}
              <Table.Row>
                <Table.Cell colspan={columns.length} class="h-24 text-center text-muted-foreground">
                  No organizations found.
                </Table.Cell>
              </Table.Row>
            {:else}
              {#each table.getRowModel().rows as row}
                <Table.Row>
                  {#each row.getVisibleCells() as cell}
                    {#if cell.column.id === "isActive"}
                      <Table.Cell>
                        <Badge
                          class={row.original.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}
                        >
                          {row.original.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </Table.Cell>
                    {:else if cell.column.id === "actions"}
                      <Table.Cell class="text-right">
                        <div class="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onclick={() => goto(`/organizations/${row.original.id}/permissions`)}
                          >
                            Permissions
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onclick={() => goto(`/organizations/${row.original.id}/edit`)}
                          >
                            Edit
                          </Button>
                          {#if row.original.isActive}
                            <Button
                              size="sm"
                              variant="destructive"
                              onclick={() => { deactivateTarget = row.original; deactivateError = ""; }}
                            >
                              Deactivate
                            </Button>
                          {/if}
                        </div>
                      </Table.Cell>
                    {:else}
                      <Table.Cell>
                        <DataTable.FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
                      </Table.Cell>
                    {/if}
                  {/each}
                </Table.Row>
              {/each}
            {/if}
          </Table.Body>
        </Table.Root>
      </div>
      <p class="text-xs text-muted-foreground">
        {orgs.length} organization{orgs.length !== 1 ? "s" : ""} total
      </p>
    {/if}
  </div>
</HydrationBoundary>

<AlertDialog.Root open={!!deactivateTarget} onOpenChange={(open) => { if (!open) deactivateTarget = null; }}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Deactivate organization?</AlertDialog.Title>
      <AlertDialog.Description>
        <strong>{deactivateTarget?.name}</strong> and all its hospitals will be inaccessible to staff.
        You can re-activate it at any time via the edit page.
      </AlertDialog.Description>
    </AlertDialog.Header>
    {#if deactivateError}
      <p class="text-sm text-destructive">{deactivateError}</p>
    {/if}
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={deactivateLoading}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        onclick={confirmDeactivate}
        disabled={deactivateLoading}
        class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {deactivateLoading ? "Deactivating…" : "Deactivate"}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
