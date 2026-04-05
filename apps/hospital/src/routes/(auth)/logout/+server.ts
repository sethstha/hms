import { redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies }) => {
	const apiUrl = (env.API_URL ?? "http://localhost:8787").trim();

	await fetch(`${apiUrl}/api/v1/auth/sign-out`, {
		method: "POST",
		headers: { cookie: request.headers.get("cookie") ?? "" },
	}).catch(() => null);

	cookies.delete("better-auth.session_token", { path: "/" });

	redirect(302, "/login");
};
