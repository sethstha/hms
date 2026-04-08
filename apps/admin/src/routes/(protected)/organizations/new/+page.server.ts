import type { PageServerLoad } from "./$types";

// Auth is handled by the parent dashboard layout.
// No data to prefetch for the create form.
export const load: PageServerLoad = async () => {
  return {};
};
