<script lang="ts">
  // Staff layout — authenticated staff pages (doctors, nurses, receptionists, etc.)
  // TODO: Add app shell with sidebar, top nav, and breadcrumbs
  // TODO: Gate this layout with session check (redirect to /login if no session)

  let { children } = $props()
</script>

<div class="flex min-h-screen">
  <!-- TODO: Add Sidebar component from @hms/ui -->
  <main class="flex-1 p-6">
    {@render children()}
  </main>
</div>
