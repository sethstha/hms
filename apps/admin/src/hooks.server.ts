import { sequence } from "@sveltejs/kit/hooks";
import type { Handle } from "@sveltejs/kit";
import { PUBLIC_API_URL } from "$env/static/public";
import { paraglideMiddleware } from "$lib/paraglide/server";
import { getTextDirection } from "$lib/paraglide/runtime";
import { fetchSession } from "@hms/auth/session";
import type { AppSession } from "$lib/auth/client";

const getApiUrl = () => PUBLIC_API_URL.trim() || "http://localhost:8787";

const handleAuth: Handle = async ({ event, resolve }) => {
  event.locals.session = await fetchSession<AppSession>(
    event.request,
    getApiUrl(),
    "/auth/admin",
  );
  event.locals.tenant = null;
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
