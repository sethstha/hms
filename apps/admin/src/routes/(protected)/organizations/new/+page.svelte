<script lang="ts">
  import { useQueryClient } from "@tanstack/svelte-query";
  import { Card } from "@hms/ui";
  import { goto } from "$app/navigation";
  import { api } from "$lib/api/index";
  import { adminRoutes } from "@hms/utils";
  import OrganizationForm from "$lib/components/OrganizationForm.svelte";
  import type { CreateOrganizationInput } from "@hms/schemas/organizations";

  const queryClient = useQueryClient();

  let loading = $state(false);
  let error = $state("");

  async function handleSubmit(data: CreateOrganizationInput) {
    loading = true;
    error = "";
    try {
      const res = await api.organizations.$post({ json: data as CreateOrganizationInput });
      if (res.status === 409) {
        const body = await res.json();
        error = "error" in body ? body.error : "Slug or domain already taken.";
        return;
      }
      if (!res.ok) throw new Error("Failed to create organization");
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      goto(adminRoutes.organizations.root);
    } catch (e) {
      error = e instanceof Error ? e.message : "Something went wrong";
    } finally {
      loading = false;
    }
  }
</script>

<div class="mx-auto max-w-xl space-y-6">
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-foreground">New Organization</h1>
    <p class="mt-1 text-sm text-muted-foreground">Create a new hospital group on the platform.</p>
  </div>
  <Card.Root>
    <Card.Content class="pt-6">
      <OrganizationForm mode="create" {loading} {error} onSubmit={handleSubmit} />
    </Card.Content>
  </Card.Root>
</div>
