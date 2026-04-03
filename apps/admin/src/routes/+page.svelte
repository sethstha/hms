<script lang="ts">
  import { m } from '../paraglide/messages.js'

  // Admin root page — redirects to /dashboard once auth is configured
  // TODO: Add redirect logic based on session state
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="text-center">
    <h1 class="text-3xl font-bold">{m.admin_home_title()}</h1>
    <p class="mt-2 text-muted-foreground">{m.admin_home_subtitle()}</p>
  </div>
</div>
