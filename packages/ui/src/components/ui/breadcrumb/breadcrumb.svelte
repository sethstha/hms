<script lang="ts">
	import type { WithElementRef } from "@hms/utils";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "@hms/utils";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<nav
	bind:this={ref}
	data-slot="breadcrumb"
	aria-label="breadcrumb"
	class={cn("cn-breadcrumb", className)}
	{...restProps}
>
	{@render children?.()}
</nav>
