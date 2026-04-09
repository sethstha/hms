import { createApiClient } from "@hms/api-client";
import { env } from "$env/dynamic/public";

export const api = createApiClient(env.PUBLIC_API_URL, {
  init: { credentials: "include" },
}).api.v1;

export const appointmentsApi = api.appointments;
export const organizationsApi = api.organizations;
