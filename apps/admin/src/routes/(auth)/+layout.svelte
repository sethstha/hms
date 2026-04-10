<script lang="ts">
  let { children } = $props();
</script>

<div class="bg-muted/40 flex min-h-screen items-center justify-center">
  {@render children()}
</div>
