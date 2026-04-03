<script lang="ts">
  import { goto } from '$app/navigation'
  import { authClient } from '$lib/auth/client'
  import { Button } from "@hms/ui/components/ui/button"

  let email = $state('superadmin@hms.internal')
  let password = $state('Demo@1234')
  let isSubmitting = $state(false)
  let errorMessage = $state<string | null>(null)

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    isSubmitting = true
    errorMessage = null

    const { data, error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: '/dashboard',
    })

    isSubmitting = false

    if (!data || error) {
      errorMessage = error?.message ?? 'Invalid email or password.'
      return
    }

    await goto('/dashboard')
  }
</script>

<div class="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm">
  <div class="mb-6 text-center">
    <h1 class="text-2xl font-semibold">Admin Sign In</h1>
    <p class="mt-1 text-sm text-muted-foreground">HMS Internal Platform</p>
    <p class="mt-2 text-xs text-muted-foreground">
      Demo: <code class="font-mono">superadmin@hms.internal</code> / <code class="font-mono">Demo@1234</code>
    </p>
  </div>

  <form class="space-y-4" onsubmit={handleSubmit}>
    <div class="space-y-2">
      <label class="text-sm font-medium" for="email">Email</label>
      <input
        class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        id="email"
        name="email"
        type="email"
        bind:value={email}
        autocomplete="email"
        required
      />
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium" for="password">Password</label>
      <input
        class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        id="password"
        name="password"
        type="password"
        bind:value={password}
        autocomplete="current-password"
        required
      />
    </div>

    {#if errorMessage}
      <p class="text-sm text-destructive">{errorMessage}</p>
    {/if}

    <Button
      type="submit"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Signing in...' : 'Sign In'}
    </Button>
  </form>
</div>
