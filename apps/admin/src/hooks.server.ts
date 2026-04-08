import { fetchSession } from "@hms/auth/session";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { PUBLIC_API_URL } from "$env/static/public";
import type { AppSession } from "$lib/auth/client";
import { getTextDirection } from "$lib/paraglide/runtime";
import { paraglideMiddleware } from "$lib/paraglide/server";

const getApiUrl = () => PUBLIC_API_URL.trim();

const handleAuth: Handle = async ({ event, resolve }) => {
  event.locals.session = await fetchSession<AppSession>(event.request, getApiUrl(), "admin");
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
