<script lang="ts">
  // PageHeader — shared page title + description component
  // Used across both hospital and admin apps for consistent heading layout

  let {
    title,
    description = '',
  }: {
    title: string
    description?: string
  } = $props()
</script>

<div class="mb-6">
  <h1 class="text-2xl font-semibold tracking-tight">{title}</h1>
  {#if description}
    <p class="mt-1 text-sm text-muted-foreground">{description}</p>
  {/if}
</div>
