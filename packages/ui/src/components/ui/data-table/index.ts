export { default as FlexRender } from "./flex-render.svelte";
export { renderComponent, renderSnippet } from "./render-helpers.js";
export { createSvelteTable } from "./data-table.svelte.js";

// Re-export table-core utilities so consumers don't need a direct dep on @tanstack/table-core.
export {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/table-core";
export type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
  Row,
  Table,
} from "@tanstack/table-core";
