<script lang="ts">
  import { goto } from '$app/navigation'
  import { authClient } from '$lib/auth/client'

  let email = $state('')
  let password = $state('')
  let isSubmitting = $state(false)
  let errorMessage = $state<string | null>(null)

  const demoAccounts = [
    { role: 'Hospital Admin', email: 'admin@citycare.hms' },
    { role: 'Doctor', email: 'doctor@citycare.hms' },
    { role: 'Nurse', email: 'nurse@citycare.hms' },
    { role: 'Receptionist', email: 'receptionist@citycare.hms' },
    { role: 'Pharmacist', email: 'pharmacist@citycare.hms' },
    { role: 'Lab Technician', email: 'lab@citycare.hms' },
    { role: 'Billing Staff', email: 'billing@citycare.hms' },
  ]

  function fillDemo(demoEmail: string) {
    email = demoEmail
    password = 'Demo@1234'
  }

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

<div class="w-full max-w-sm space-y-4">
  <div class="rounded-lg border bg-card p-8 shadow-sm">
    <div class="mb-6 text-center">
      <h1 class="text-2xl font-semibold">Sign In</h1>
      <p class="mt-1 text-sm text-muted-foreground">HMS Hospital Staff Portal</p>
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
      <Button></Button>
      <button
        class="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  </div>

  <!-- Demo Credentials -->
  <div class="rounded-lg border border-dashed bg-card p-4">
    <p class="mb-1 text-xs font-medium text-muted-foreground">Demo accounts</p>
    <p class="mb-3 text-xs text-muted-foreground">
      Password for all: <code class="font-mono font-semibold text-foreground">Demo@1234</code>
    </p>
    <div class="space-y-0.5">
      {#each demoAccounts as account}
        <button
          type="button"
          onclick={() => fillDemo(account.email)}
          class="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted"
        >
          <span class="font-medium">{account.role}</span>
          <span class="font-mono text-muted-foreground">{account.email}</span>
        </button>
      {/each}
    </div>
  </div>
</div>
