<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { HydrationBoundary } from "@tanstack/svelte-query";
  import { Card } from "@hms/ui";
  import { goto } from "$app/navigation";
  import { api } from "$lib/api/index";
  import OrganizationForm from "$lib/components/OrganizationForm.svelte";
  import type { UpdateOrganizationInput } from "@hms/schemas/organizations";
  import type { PageData } from "./$types";

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

  const org = $derived(
    (($orgsQuery.data as { data: Organization[] } | undefined)?.data ?? []).find(
      (o) => o.slug === data.slug,
    ) ?? null,
  );

  let loading = $state(false);
  let error = $state("");

  async function handleSubmit(patch: UpdateOrganizationInput) {
    loading = true;
    error = "";
    try {
      const res = await api.organizations[":slug"].$patch({
        param: { slug: data.slug },
        json: patch,
      });
      if (!res.ok) throw new Error("Failed to update organization");
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      goto("/organizations");
    } catch (e) {
      error = e instanceof Error ? e.message : "Something went wrong";
    } finally {
      loading = false;
    }
  }
</script>

<HydrationBoundary state={data.dehydratedState}>
  <div class="mx-auto max-w-xl space-y-6">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">Edit Organization</h1>
      {#if org}
        <p class="mt-1 text-sm text-muted-foreground">
          Editing <span class="font-medium text-foreground">{org.name}</span>
          <span class="ml-1 font-mono text-xs">({org.slug})</span>
        </p>
      {/if}
    </div>

    {#if $orgsQuery.isPending}
      <div class="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading…</div>
    {:else if !org}
      <div class="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Organization not found.
      </div>
    {:else}
      <Card.Root>
        <Card.Content class="pt-6">
          <OrganizationForm
            mode="edit"
            name={org.name}
            domain={org.domain ?? ""}
            isActive={org.isActive}
            {loading}
            {error}
            onSubmit={handleSubmit}
          />
        </Card.Content>
      </Card.Root>
    {/if}
  </div>
</HydrationBoundary>
