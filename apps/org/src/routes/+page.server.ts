import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.session && locals.tenant) redirect(302, "/dashboard");
  redirect(302, "/login");
};
