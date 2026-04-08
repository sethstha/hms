import type { PageServerLoad } from "./$types";

// Auth is enforced by the parent (protected) layout.
// No SSR prefetch needed — the form starts empty.
export const load: PageServerLoad = async () => {
  return {};
};
