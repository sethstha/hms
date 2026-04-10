<script lang="ts">
  import { useQueryClient } from "@tanstack/svelte-query";
  import { Button, Card, Input, Label } from "@hms/ui";
  import { goto } from "$app/navigation";
  import { api } from "$lib/api/index";
  import { adminRoutes } from "@hms/utils";

  const queryClient = useQueryClient();

  let name = $state("");
  let slug = $state("");
  let slugEdited = $state(false);
  let description = $state("");
  let loading = $state(false);
  let error = $state("");

  // ─── Slug validation state ────────────────────────────────────────────────────
  let slugChecking = $state(false);
  let slugAvailable = $state<boolean | null>(null);
  let slugCheckTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── TODO: Implement slug auto-generation ────────────────────────────────────
  // Convert `name` → a valid permission slug whenever the user hasn't
  // manually edited the slug field.
  //
  // Rules (must match createPermissionSchema in @hms/schemas/permissions):
  //   • Lowercase only
  //   • Alphanumeric characters, hyphens, and underscores (no spaces or special chars)
  //   • Cannot start or end with a hyphen/underscore
  //   • Max 63 characters
  //
  // Hint: Chain .toLowerCase(), .replace(), .trim() — around 3-5 lines.
  //       Underscores are preferred over hyphens here (e.g. "lab_results").
  //
  // Example: "Lab Results" → "lab_results"
  //          "OPD & Pharmacy!" → "opd_pharmacy"
  function nameToSlug(n: string): string {
    // ← Your implementation here (replace this line)
    return n;
  }
  // ─────────────────────────────────────────────────────────────────────────────

  $effect(() => {
    if (!slugEdited) {
      slug = nameToSlug(name);
    }
  });

  // Debounced async slug uniqueness check
  $effect(() => {
    const currentSlug = slug;
    slugAvailable = null;

    if (!currentSlug || currentSlug.length < 2) return;

    if (slugCheckTimer) clearTimeout(slugCheckTimer);
    slugChecking = true;

    slugCheckTimer = setTimeout(async () => {
      try {
        const res = await api.permissions["slug-check"].$get({ query: { slug: currentSlug } });
        if (res.ok) {
          const body = await res.json();
          slugAvailable = (body as { available: boolean }).available;
        }
      } catch {
        slugAvailable = null;
      } finally {
        slugChecking = false;
      }
    }, 400);
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (slugAvailable === false) return;

    loading = true;
    error = "";
    try {
      const res = await api.permissions.$post({
        json: { name, slug, description: description || undefined },
      });
      if (res.status === 409) {
        const body = await res.json();
        error = "error" in body ? (body as { error: string }).error : "Slug already taken.";
        slugAvailable = false;
        return;
      }
      if (!res.ok) throw new Error("Failed to create permission");
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
    <h1 class="text-2xl font-semibold tracking-tight text-foreground">New Permission</h1>
    <p class="mt-1 text-sm text-muted-foreground">
      Add a module to the global permission catalog. Organizations can then be assigned this permission.
    </p>
  </div>

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

        <!-- Slug (auto-generated, immutable after creation) -->
        <div class="space-y-1.5">
          <Label for="perm-slug">
            Slug
            <span class="ml-1 text-xs font-normal text-muted-foreground">(immutable after creation)</span>
          </Label>
          <div class="relative">
            <Input
              id="perm-slug"
              value={slug}
              oninput={(e) => {
                slugEdited = true;
                slug = (e.target as HTMLInputElement).value;
              }}
              placeholder="e.g. laboratory"
              required
              disabled={loading}
              class={slugAvailable === false ? "border-destructive" : slugAvailable === true ? "border-green-500" : ""}
            />
          </div>
          {#if slug.length >= 2}
            {#if slugChecking}
              <p class="text-xs text-muted-foreground">Checking availability…</p>
            {:else if slugAvailable === true}
              <p class="text-xs text-green-600 dark:text-green-400">Slug is available.</p>
            {:else if slugAvailable === false}
              <p class="text-xs text-destructive">Slug is already taken.</p>
            {/if}
          {/if}
        </div>

        <!-- Description (optional) -->
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
          <Button type="submit" disabled={loading || slugAvailable === false}>
            {loading ? "Creating…" : "Create Permission"}
          </Button>
          <Button type="button" variant="outline" disabled={loading} onclick={() => history.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Card.Content>
  </Card.Root>
</div>
