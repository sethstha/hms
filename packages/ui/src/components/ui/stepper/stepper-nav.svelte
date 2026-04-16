<script lang="ts">
  import { cn } from "@hms/utils";
  import { box } from "svelte-toolbelt";
  import { useStepperNav } from "./stepper.svelte.js";
  import type { StepperNavProps } from "./types";

  let {
    orientation = "horizontal",
    class: className,
    children,
    ...rest
  }: StepperNavProps = $props();

  const stepperNavState = useStepperNav({
    orientation: box.with(() => orientation),
  });
</script>

<div
  data-slot="stepper-nav"
  class={cn(
    "group/stepper-nav flex",
    {
      "flex-row justify-between": orientation === "horizontal",
      "flex-col gap-2": orientation === "vertical",
    },
    className,
  )}
  {...stepperNavState.props}
  {...rest}
>
  {@render children?.()}
</div>
