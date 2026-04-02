<script lang="ts">
  // Auth layout — unauthenticated pages (login, forgot password, etc.)
  // No sidebar or nav — clean centered layout

  let { children } = $props()
</script>

<div class="flex min-h-screen items-center justify-center bg-muted/40">
  {@render children()}
</div>
