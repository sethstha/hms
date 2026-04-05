import { sequence } from "@sveltejs/kit/hooks";
import type { Handle } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { getTextDirection } from "$lib/paraglide/runtime";
import { paraglideMiddleware } from "$lib/paraglide/server";
import { getSession, readTenant } from "@hms/auth/session";
import type { AppSession } from "$lib/auth/client";

const getApiBaseUrl = (): string => {
	const apiUrl = (env.API_URL ?? "").trim();
	return apiUrl.length > 0 ? apiUrl : "http://localhost:8787";
};

const handleAuth: Handle = async ({ event, resolve }) => {
	const session = await getSession<AppSession>(event.request, getApiBaseUrl());
	event.locals.session = session;
	event.locals.tenant = readTenant(session);
	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace("%paraglide.lang%", locale)
					.replace("%paraglide.dir%", getTextDirection(locale)),
		});
	});

export const handle: Handle = sequence(handleAuth, handleParaglide);
