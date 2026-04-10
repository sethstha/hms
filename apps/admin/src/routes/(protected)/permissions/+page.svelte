<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { HydrationBoundary } from "@tanstack/svelte-query";
  import { DataTable, Table, Badge, Button, AlertDialog } from "@hms/ui";
  import { goto } from "$app/navigation";
  import { api } from "$lib/api/index";
  import { adminRoutes } from "@hms/utils";
  import type { Permission } from "@hms/schemas";
  import type { PageData } from "./$types";
  import type { ColumnDef, SortingState } from "@hms/ui";

  let { data }: { data: PageData } = $props();

  const queryClient = useQueryClient();

  const permissionsQuery = createQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await api.permissions.$get();
      if (!res.ok) throw new Error("Failed to fetch permissions");
      return res.json();
    },
  });

  // ─── Deactivate (soft delete) flow ───────────────────────────────────────────
  let deactivateTarget = $state<Permission | null>(null);
  let deactivateLoading = $state(false);
  let deactivateError = $state("");

  async function confirmDeactivate() {
    if (!deactivateTarget) return;
    deactivateLoading = true;
    deactivateError = "";
    try {
      const res = await api.permissions[":id"].$delete({ param: { id: deactivateTarget.id } });
      if (!res.ok) throw new Error("Failed to deactivate permission");
      await queryClient.invalidateQueries({ queryKey: ["permissions"] });
      deactivateTarget = null;
    } catch (e) {
      deactivateError = e instanceof Error ? e.message : "Something went wrong";
    } finally {
      deactivateLoading = false;
    }
  }

  // ─── TanStack Table ──────────────────────────────────────────────────────────
  let sorting = $state<SortingState>([]);

  const columns: ColumnDef<Permission>[] = [
    { accessorKey: "name", header: "Name", enableSorting: true },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: (info) => (info.getValue() as string | null) ?? "—",
    },
    { accessorKey: "isActive", header: "Status", enableSorting: true },
    { id: "actions", header: "", enableSorting: false },
  ];

  const rows = $derived(
    (($permissionsQuery.data as { data: Permission[] } | undefined)?.data ?? []),
  );

  const table = $derived(
    DataTable.createSvelteTable<Permission>({
      get data() { return rows; },
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
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">Global Permissions</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Define which modules are available across the platform. Organizations are assigned from this catalog.
        </p>
      </div>
      <Button onclick={() => goto(adminRoutes.permissions.new)}>
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Permission
      </Button>
    </div>

    {#if $permissionsQuery.isPending}
      <div class="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading…</div>
    {:else if $permissionsQuery.isError}
      <div class="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Failed to load permissions. Please refresh.
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
                  No permissions found.
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
                    {:else if cell.column.id === "slug"}
                      <Table.Cell>
                        <code class="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                          {row.original.slug}
                        </code>
                      </Table.Cell>
                    {:else if cell.column.id === "actions"}
                      <Table.Cell class="text-right">
                        <div class="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onclick={() => goto(`/permissions/${row.original.id}/edit`)}
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
        {rows.length} permission{rows.length !== 1 ? "s" : ""} total
      </p>
    {/if}
  </div>
</HydrationBoundary>

<AlertDialog.Root
  open={!!deactivateTarget}
  onOpenChange={(open) => { if (!open) deactivateTarget = null; }}
>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Deactivate permission?</AlertDialog.Title>
      <AlertDialog.Description>
        <strong>{deactivateTarget?.name}</strong> will be hidden from all organization assignment
        pages. Existing assignments are preserved — this is a soft delete and can be reversed.
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
