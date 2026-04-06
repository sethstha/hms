import { redirect } from "@sveltejs/kit";
import { PUBLIC_API_URL } from "$env/static/public";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const apiUrl = PUBLIC_API_URL.trim() || "http://localhost:8787";

  await fetch(`${apiUrl}/auth/hospital/sign-out`, {
    method: "POST",
    headers: { cookie: request.headers.get("cookie") ?? "" },
  }).catch(() => null);

  cookies.delete("better-auth.session_token", { path: "/" });

  redirect(302, "/login");
};
