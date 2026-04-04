<script lang="ts">
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-semibold">Dashboard</h1>
    <p class="mt-1 text-sm text-muted-foreground">
      Welcome back, {data.user.name}
    </p>
    <span class="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
      {data.user.role}
    </span>
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
