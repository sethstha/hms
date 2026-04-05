<script lang="ts">
  import { cn } from "@hms/utils";
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import type { ComponentProps } from "svelte";
  import { PaginationLink } from "./index.js";

  type PaginationPreviousProps = ComponentProps<typeof PaginationLink>;

  let { class: className, ...restProps }: PaginationPreviousProps = $props();
</script>

<PaginationLink
  aria-label="Go to previous page"
  size="default"
  class={cn("pl-2!", className)}
  {...restProps}
>
  <ChevronLeftIcon data-icon="inline-start" />
  <span class="cn-pagination-previous-text hidden sm:block">Previous</span>
</PaginationLink>
