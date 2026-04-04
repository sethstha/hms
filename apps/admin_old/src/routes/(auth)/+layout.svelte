<script lang="ts">
  // Auth layout for admin app — clean centered layout for login page

  let { children } = $props()
</script>

<div class="flex min-h-screen items-center justify-center bg-muted/40">
  {@render children()}
</div>
