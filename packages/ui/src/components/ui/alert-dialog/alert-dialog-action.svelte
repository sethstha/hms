<script lang="ts">
  import { cn } from "@hms/utils";
  import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
  import { buttonVariants, type ButtonSize, type ButtonVariant } from "../button/index.js";

  let {
    ref = $bindable(null),
    class: className,
    variant = "default",
    size = "default",
    ...restProps
  }: AlertDialogPrimitive.ActionProps & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  } = $props();
</script>

<AlertDialogPrimitive.Action
  bind:ref
  data-slot="alert-dialog-action"
  class={cn(buttonVariants({ variant, size }), "cn-alert-dialog-action", className)}
  {...restProps}
/>
