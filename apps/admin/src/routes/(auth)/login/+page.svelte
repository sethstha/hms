<!-- apps/admin/src/routes/login/+page.svelte -->
<script lang="ts">
  import { loginSchema } from "@hms/schemas";
  import { Alert, Button, Card, Input, Label } from "@hms/ui";
  import { createForm } from "@tanstack/svelte-form";
  import { zodValidator } from "@tanstack/zod-form-adapter";
  import { goto } from "$app/navigation";
  import { authClient } from "$lib/auth/client";

  let errorMessage = $state<string | undefined>(undefined);

  const form = createForm(() => ({
    defaultValues: {
      email: "superadmin@hms.internal",
      password: "Demo@1234",
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      // call your Hono API here
      console.log(value);
      const { data, error } = await authClient.signIn.email({
        email: value.email,
        password: value.password,
        callbackURL: "/dashboard",
      });

      if (!data || error) {
        errorMessage = error?.message ?? "Invalid email or password.";
        return;
      }

      await goto("/demo");
    },
  }));
</script>

<div class="flex min-h-screen items-center justify-center">
  <Card.Root class="w-full min-w-sm">
    <Card.Header>
      <Card.Title>Sign in</Card.Title>
      <Card.Description>Enter your credentials to continue</Card.Description>
    </Card.Header>

    <Card.Content>
      <form
        onsubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        class="flex flex-col gap-4"
      >
        <!-- Email -->
        <form.Field name="email" validators={{ onChange: loginSchema.shape.email }}>
          {#snippet children(field)}
            <div class="flex flex-col gap-1.5">
              <Label for={field.name}>Email</Label>
              <Input
                id={field.name}
                type="email"
                placeholder="you@example.com"
                value={field.state.value}
                onblur={field.handleBlur}
                oninput={(e) => field.handleChange(e.currentTarget.value)}
              />
              {#if field.state.meta.errors.length}
                <p class="text-destructive text-sm">
                  {field.state.meta.errors[0]?.message}
                </p>
              {/if}
            </div>
          {/snippet}
        </form.Field>

        <!-- Password -->
        <form.Field name="password" validators={{ onChange: loginSchema.shape.password }}>
          {#snippet children(field)}
            <div class="flex flex-col gap-1.5">
              <Label for={field.name}>Password</Label>
              <Input
                id={field.name}
                type="password"
                placeholder="••••••••"
                value={field.state.value}
                onblur={field.handleBlur}
                oninput={(e) => field.handleChange(e.currentTarget.value)}
              />
              {#if field.state.meta.errors.length}
                <p class="text-destructive text-sm">
                  {field.state.meta.errors[0]?.message}
                </p>
              {/if}
            </div>
          {/snippet}
        </form.Field>

        {#if errorMessage}
          <Alert.Root variant="destructive">
            <Alert.Title>{errorMessage}</Alert.Title>
          </Alert.Root>
        {/if}
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {#snippet children(isSubmitting)}
            <Button type="submit" class="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          {/snippet}
        </form.Subscribe>
      </form>
    </Card.Content>
  </Card.Root>
</div>
