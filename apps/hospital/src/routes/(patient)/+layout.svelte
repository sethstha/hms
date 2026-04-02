<script lang="ts">
  // Patient layout — patient-facing portal pages
  // TODO: Add patient portal nav (appointments, records, bills)
  // TODO: Gate with patient session check

  let { children } = $props()
</script>

<div class="min-h-screen bg-muted/20">
  <!-- TODO: Add patient portal header -->
  <main class="mx-auto max-w-4xl p-6">
    {@render children()}
  </main>
</div>
