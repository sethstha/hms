import { createApiClient } from "@hms/api-client";
import { PUBLIC_API_URL } from "$env/static/public";

export const api = createApiClient(PUBLIC_API_URL, {
  init: { credentials: "include" },
}).api.v1;

export const appointmentsApi = api.appointments;
export const organizationsApi = api.organizations;
