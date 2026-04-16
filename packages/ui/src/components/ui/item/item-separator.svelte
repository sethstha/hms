<script lang="ts">
  import { cn } from "@hms/utils";
  import type { ComponentProps } from "svelte";
  import { Separator } from "../separator/index.js";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: ComponentProps<typeof Separator> = $props();
</script>

<Separator
  bind:ref
  data-slot="item-separator"
  orientation="horizontal"
  class={cn("my-2", className)}
  {...restProps}
/>
