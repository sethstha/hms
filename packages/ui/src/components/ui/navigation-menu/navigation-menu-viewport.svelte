<script lang="ts">
  import { cn } from "@hms/utils";
  import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: NavigationMenuPrimitive.ViewportProps = $props();
</script>

<div class={cn("absolute start-0 top-full isolate z-50 flex justify-center")}>
  <NavigationMenuPrimitive.Viewport
    bind:ref
    data-slot="navigation-menu-viewport"
    class={cn(
      "origin-top-center relative mt-1.5 h-[calc(var(--bits-navigation-menu-viewport-height)+1rem)] w-full overflow-hidden rounded-lg bg-popover text-popover-foreground shadow ring-1 ring-foreground/10 duration-100 data-[state=closed]:animate-out data-[state=closed]:zoom-out-90 data-[state=open]:animate-in data-[state=open]:zoom-in-90 md:w-[calc(var(--bits-navigation-menu-viewport-width)+1rem)]",
      className,
    )}
    {...restProps}
  />
</div>
