<script lang="ts">
  import { box } from "svelte-toolbelt";
  import { useStepperRoot } from "./stepper.svelte.js";
  import type { StepperRootProps } from "./types";

  let { step = $bindable(1), children }: StepperRootProps = $props();

  useStepperRoot({
    step: box.with(
      () => step,
      (v) => (step = v),
    ),
  });
</script>

{@render children?.()}
