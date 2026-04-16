<script lang="ts">
  import type {
    CreateOrganizationInput,
    UpdateOrganizationInput,
  } from "@hms/schemas/organizations";
  import { Button, Input, Label, Switch } from "@hms/ui";

  type Props = {
    mode: "create" | "edit";
    name?: string;
    domain?: string;
    isActive?: boolean;
    loading?: boolean;
    error?: string;
    onSubmit: (data: CreateOrganizationInput | UpdateOrganizationInput) => Promise<void>;
  };

  let {
    mode,
    name: initialName = "",
    domain: initialDomain = "",
    isActive: initialIsActive = true,
    loading = false,
    error = "",
    onSubmit,
  }: Props = $props();

  let name = $state(initialName);
  let slug = $state("");
  let slugEdited = $state(false);
  let domain = $state(initialDomain);
  let isActive = $state(initialIsActive);

  // ─── TODO: Implement slug auto-generation ────────────────────────────────────
  // Convert `name` → a valid slug whenever the user hasn't manually edited the slug.
  //
  // Rules (must match slugSchema in @hms/schemas/organizations):
  //   • Lowercase only
  //   • Alphanumeric characters and hyphens only (no spaces or special chars)
  //   • Cannot start or end with a hyphen
  //   • Max 63 characters
  //
  // Hint: Chain .toLowerCase(), .replace(), .slice() — around 3-5 lines.
  //
  // Example: "Sunrise Health Group" → "sunrise-health-group"
  function nameToSlug(n: string): string {
    // ← Your implementation here (replace this line)
    return n;
  }
  // ─────────────────────────────────────────────────────────────────────────────

  $effect(() => {
    if (mode === "create" && !slugEdited) {
      slug = nameToSlug(name);
    }
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    if (mode === "create") {
      await onSubmit({ name, slug, domain: domain || undefined });
    } else {
      const patch: UpdateOrganizationInput = {};
      if (name !== initialName) patch.name = name;
      if (domain !== initialDomain) patch.domain = domain || null;
      if (isActive !== initialIsActive) patch.isActive = isActive;
      await onSubmit(patch);
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-5">
  {#if error}
    <div
      class="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {error}
    </div>
  {/if}

  <div class="space-y-1.5">
    <Label for="org-name">Organization Name</Label>
    <Input
      id="org-name"
      bind:value={name}
      placeholder="e.g. Sunrise Health Group"
      required
      disabled={loading}
    />
  </div>

  {#if mode === "create"}
    <div class="space-y-1.5">
      <Label for="org-slug">
        Slug
        <span class="ml-1 text-xs font-normal text-muted-foreground"
          >(subdomain — immutable after creation)</span
        >
      </Label>
      <Input
        id="org-slug"
        value={slug}
        oninput={(e) => {
          slugEdited = true;
          slug = (e.target as HTMLInputElement).value;
        }}
        placeholder="e.g. sunrise-health-group"
        required
        disabled={loading}
      />
      {#if slug}
        <p class="text-xs text-muted-foreground">
          Accessible at <span class="font-mono">{slug}.yoursaas.com</span>
        </p>
      {/if}
    </div>
  {/if}

  <div class="space-y-1.5">
    <Label for="org-domain">
      Custom Domain
      <span class="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
    </Label>
    <Input
      id="org-domain"
      bind:value={domain}
      placeholder="e.g. health.sunrise.com"
      disabled={loading}
    />
  </div>

  {#if mode === "edit"}
    <div class="flex items-center gap-3">
      <Switch id="org-active" bind:checked={isActive} disabled={loading} />
      <Label for="org-active">Active</Label>
    </div>
  {/if}

  <div class="flex gap-3 pt-2">
    <Button type="submit" disabled={loading}>
      {loading ? "Saving…" : mode === "create" ? "Create Organization" : "Save Changes"}
    </Button>
    <Button type="button" variant="outline" disabled={loading} onclick={() => history.back()}>
      Cancel
    </Button>
  </div>
</form>
