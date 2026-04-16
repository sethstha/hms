<script lang="ts">
  import type { OrgPermission, Permission } from "@hms/schemas";
  import { Badge, Button, Checkbox, Table } from "@hms/ui";
  import { createForm } from "@tanstack/svelte-form";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { api } from "$lib/api/index";

  type Props = {
    catalog: Permission[];
    grantsMap: Map<string, OrgPermission>;
    orgId: string;
    slug: string;
  };

  const { catalog, grantsMap, orgId, slug }: Props = $props();

  const queryClient = useQueryClient();
  let submitError = $state("");

  const crudFields = ["canCreate", "canRead", "canUpdate", "canDelete"] as const;

  const form = createForm(() => ({
    defaultValues: {
      permissions: catalog.map((p) => {
        const grant = grantsMap.get(p.id);
        return {
          canCreate: grant?.canCreate ?? false,
          canRead: grant?.canRead ?? false,
          canUpdate: grant?.canUpdate ?? false,
          canDelete: grant?.canDelete ?? false,
        };
      }),
    },
    onSubmit: async ({ value }) => {
      submitError = "";
      // Reconstruct permissionId from catalog — form only tracks the boolean flags
      const permissions = value.permissions.map((flags, i) => ({
        permissionId: catalog[i].id,
        ...flags,
      }));
      const res = await api.organizations[":id"].permissions.$put({
        param: { id: orgId },
        json: permissions,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        submitError = (data as { error?: string }).error ?? "Failed to update permissions";
        throw new Error(submitError);
      }
      await queryClient.invalidateQueries({ queryKey: ["org-permissions", slug] });
    },
  }));

  function selectAll() {
    catalog.forEach((_, i) => {
      crudFields.forEach((f) => form.setFieldValue(`permissions[${i}].${f}`, true));
    });
  }

  function deselectAll() {
    catalog.forEach((_, i) => {
      crudFields.forEach((f) => form.setFieldValue(`permissions[${i}].${f}`, false));
    });
  }
</script>

<form
  onsubmit={(e) => {
    e.preventDefault();
    form.handleSubmit();
  }}
  class="space-y-4"
>
  {#if submitError}
    <div
      class="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {submitError}
    </div>
  {/if}

  <div class="rounded-lg border bg-card">
    <Table.Root>
      <Table.Header>
        <Table.Row class="hover:bg-transparent">
          <Table.Head class="w-48">Permission</Table.Head>
          <Table.Head class="w-24 text-center">Create</Table.Head>
          <Table.Head class="w-24 text-center">Read</Table.Head>
          <Table.Head class="w-24 text-center">Update</Table.Head>
          <Table.Head class="w-24 text-center">Delete</Table.Head>
          <Table.Head class="text-right">
            <div class="flex items-center justify-end gap-1">
              <button
                type="button"
                class="cursor-pointer text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                onclick={selectAll}
              >
                Select all
              </button>
              <span class="text-xs text-muted-foreground">/</span>
              <button
                type="button"
                class="cursor-pointer text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                onclick={deselectAll}
              >
                Deselect all
              </button>
            </div>
          </Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each catalog as permission, i}
          <Table.Row>
            <Table.Cell>
              <div class="font-medium">{permission.name}</div>
              {#if permission.description}
                <div class="text-xs text-muted-foreground">{permission.description}</div>
              {/if}
            </Table.Cell>

            {#each crudFields as fieldName}
              <Table.Cell class="text-center">
                <form.Field name={`permissions[${i}].${fieldName}`}>
                  {#snippet children(field)}
                    <div class="flex justify-center">
                      <Checkbox
                        checked={field.state.value as boolean}
                        onCheckedChange={(v) => field.handleChange(v === true)}
                      />
                    </div>
                  {/snippet}
                </form.Field>
              </Table.Cell>
            {/each}

            <Table.Cell class="text-right">
              {#if grantsMap.has(permission.id)}
                <Badge class="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Granted
                </Badge>
              {/if}
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <div class="flex items-center justify-between">
    <p class="text-xs text-muted-foreground">
      {grantsMap.size} of {catalog.length} permission{catalog.length !== 1 ? "s" : ""} granted
    </p>
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {#snippet children(isSubmitting)}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save Changes"}
        </Button>
      {/snippet}
    </form.Subscribe>
  </div>
</form>
