<script lang="ts">
  // HMS Admin — Dashboard
  // TODO: Show platform-level metrics (active tenants, total patients, API usage)
  // TODO: Add recent activity feed (new tenant sign-ups, support tickets)
  // TODO: Add quick actions (create tenant, manage plans)
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-semibold">HMS Admin — Dashboard</h1>
    <p class="mt-1 text-sm text-muted-foreground">Platform administration overview</p>
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {#each ['Active Tenants', 'Total Patients', 'API Requests (24h)', 'Active Sessions'] as metric}
      <div class="rounded-lg border bg-card p-4">
        <p class="text-sm text-muted-foreground">{metric}</p>
        <p class="mt-1 text-2xl font-bold text-muted-foreground/40">—</p>
      </div>
    {/each}
  </div>
</div>
