<script lang="ts">
  // HMS Hospital — Staff Dashboard
  // TODO: Add key metrics (today's appointments, OPD queue, bed occupancy)
  // TODO: Add quick action buttons (new appointment, new patient, OPD token)
  // TODO: Add recent activity feed
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-semibold">HMS Hospital — Dashboard</h1>
    <p class="mt-1 text-sm text-muted-foreground">Welcome to the staff dashboard</p>
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {#each ['Today\'s Appointments', 'OPD Queue', 'Inpatients', 'Available Beds'] as metric}
      <div class="rounded-lg border bg-card p-4">
        <p class="text-sm text-muted-foreground">{metric}</p>
        <p class="mt-1 text-2xl font-bold text-muted-foreground/40">—</p>
      </div>
    {/each}
  </div>
</div>
