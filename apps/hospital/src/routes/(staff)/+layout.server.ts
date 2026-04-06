import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const { session, tenant } = locals;
  if (!session || !tenant) redirect(302, "/login");
  return { session, tenant };
};
