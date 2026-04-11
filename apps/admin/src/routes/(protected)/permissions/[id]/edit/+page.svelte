<script lang="ts">
  // SPA mode: use URL params directly, never rely on SSR-loaded ids
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { Button, Card, Input, Label, Switch } from "@hms/ui";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { api } from "$lib/api/index";
  import { adminRoutes } from "@hms/utils";
  import type { Permission } from "@hms/schemas";

  const queryClient = useQueryClient();

  const permissionsQuery = createQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await api.permissions.$get();
      if (!res.ok) throw new Error("Failed to fetch permissions");
      return res.json();
    },
  });

  const permission = $derived(
    (($permissionsQuery.data as { data: Permission[] } | undefined)?.data ?? []).find(
      (p) => p.id === page.params.id,
    ) ?? null,
  );

  // Form state — populated once the permission loads
  let name = $state("");
  let description = $state("");
  let loading = $state(false);
  let error = $state("");
  let initialized = $state(false);

  $effect(() => {
    if (permission && !initialized) {
      name = permission.name;
      description = permission.description ?? "";
      initialized = true;
    }
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!permission) return;

    loading = true;
    error = "";

    const patch: { name?: string; description?: string | null } = {};
    if (name !== permission.name) patch.name = name;
    if (description !== (permission.description ?? "")) {
      patch.description = description || null;
    }

    if (Object.keys(patch).length === 0) {
      goto(adminRoutes.permissions.root);
      return;
    }

    try {
      const res = await api.permissions[":id"].$patch({
        param: { id: page.params.id },
        json: patch,
      });
      if (!res.ok) throw new Error("Failed to update permission");
      await queryClient.invalidateQueries({ queryKey: ["permissions"] });
      goto(adminRoutes.permissions.root);
    } catch (e) {
      error = e instanceof Error ? e.message : "Something went wrong";
    } finally {
      loading = false;
    }
  }
</script>

<div class="mx-auto max-w-xl space-y-6">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">Edit Permission</h1>
      {#if permission}
        <p class="mt-1 text-sm text-muted-foreground">
          Editing <span class="font-medium text-foreground">{permission.name}</span>
          <code class="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{permission.slug}</code>
        </p>
      {/if}
    </div>

    {#if $permissionsQuery.isPending}
      <div class="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading…</div>
    {:else if !permission}
      <div class="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Permission not found.
      </div>
    {:else}
      <Card.Root>
        <Card.Content class="pt-6">
          <form onsubmit={handleSubmit} class="space-y-5">
            {#if error}
              <div class="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            {/if}

            <!-- Name -->
            <div class="space-y-1.5">
              <Label for="perm-name">Name</Label>
              <Input
                id="perm-name"
                bind:value={name}
                placeholder="e.g. Laboratory"
                required
                disabled={loading}
              />
            </div>

            <!-- Slug (read-only — immutable) -->
            <div class="space-y-1.5">
              <Label for="perm-slug">
                Slug
                <span class="ml-1 text-xs font-normal text-muted-foreground">(immutable — cannot be changed)</span>
              </Label>
              <Input
                id="perm-slug"
                value={permission.slug}
                disabled
                class="bg-muted text-muted-foreground"
              />
            </div>

            <!-- Description -->
            <div class="space-y-1.5">
              <Label for="perm-description">
                Description
                <span class="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="perm-description"
                bind:value={description}
                placeholder="e.g. Access to laboratory test orders and results"
                disabled={loading}
              />
            </div>

            <div class="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" disabled={loading} onclick={() => history.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card.Root>
    {/if}
  </div>
