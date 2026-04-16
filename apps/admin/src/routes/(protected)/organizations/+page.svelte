<script lang="ts">
  // SPA mode: use URL params directly, never rely on SSR-loaded ids
  import { Badge, Button, DataTable, Switch, Table } from "@hms/ui";
  import type { ColumnDef, SortingState } from "@hms/ui";
  import { adminRoutes } from "@hms/utils";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { goto } from "$app/navigation";
  import { api } from "$lib/api/index";

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

  // ─── Toggle active flow ──────────────────────────────────────────────────────
  let togglingId = $state<string | null>(null);

  async function toggleActive(org: Organization) {
    togglingId = org.id;
    try {
      const res = await api.organizations[":id"].$patch({
        param: { id: org.id },
        json: { isActive: !org.isActive },
      });
      if (!res.ok) throw new Error("Failed to update organization");
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    } finally {
      togglingId = null;
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
      get data() {
        return orgs;
      },
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

<div class="space-y-5">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-foreground text-2xl font-semibold tracking-tight">Organizations</h1>
      <p class="text-muted-foreground mt-1 text-sm">
        All registered hospital groups on the platform.
      </p>
    </div>
    <Button onclick={() => goto(adminRoutes.organizations.new)}>
      <svg
        class="mr-2 size-4"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      Add Organization
    </Button>
  </div>

  {#if $orgsQuery.isPending}
    <div
      class="
        text-muted-foreground flex h-40 items-center justify-center text-sm
      "
    >
      Loading…
    </div>
  {:else if $orgsQuery.isError}
    <div
      class="
        border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-4
        py-3 text-sm
      "
    >
      Failed to load organizations. Please refresh.
    </div>
  {:else}
    <div class="bg-card rounded-lg border">
      <Table.Root>
        <Table.Header>
          {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
            <Table.Row class="hover:bg-transparent">
              {#each headerGroup.headers as header (header.id)}
                <Table.Head
                  class={header.column.getCanSort() ? `cursor-pointer select-none` : ""}
                  onclick={header.column.getCanSort()
                    ? header.column.getToggleSortingHandler()
                    : undefined}
                >
                  <DataTable.FlexRender
                    content={header.column.columnDef.header}
                    context={header.getContext()}
                  />
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
              <Table.Cell colspan={columns.length} class="text-muted-foreground h-24 text-center">
                No organizations found.
              </Table.Cell>
            </Table.Row>
          {:else}
            {#each table.getRowModel().rows as row (row.id)}
              <Table.Row>
                {#each row.getVisibleCells() as cell (cell.id)}
                  {#if cell.column.id === "isActive"}
                    <Table.Cell>
                      <Badge
                        class={row.original.isActive
                          ? `
                            bg-green-100 text-green-700
                            dark:bg-green-900/30 dark:text-green-400
                          `
                          : `
                            bg-zinc-100 text-zinc-500
                            dark:bg-zinc-800 dark:text-zinc-400
                          `}
                      >
                        {row.original.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Table.Cell>
                  {:else if cell.column.id === "actions"}
                    <Table.Cell class="text-right">
                      <div class="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onclick={() =>
                            goto(adminRoutes.organizations.permissions(row.original.slug))}
                        >
                          Permissions
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onclick={() => goto(adminRoutes.organizations.edit(row.original.slug))}
                        >
                          Edit
                        </Button>
                        <Switch
                          checked={row.original.isActive}
                          disabled={togglingId === row.original.id}
                          onCheckedChange={() => toggleActive(row.original)}
                        />
                      </div>
                    </Table.Cell>
                  {:else}
                    <Table.Cell>
                      <DataTable.FlexRender
                        content={cell.column.columnDef.cell}
                        context={cell.getContext()}
                      />
                    </Table.Cell>
                  {/if}
                {/each}
              </Table.Row>
            {/each}
          {/if}
        </Table.Body>
      </Table.Root>
    </div>
    <p class="text-muted-foreground text-xs">
      {orgs.length} organization{orgs.length !== 1 ? "s" : ""} total
    </p>
  {/if}
</div>
