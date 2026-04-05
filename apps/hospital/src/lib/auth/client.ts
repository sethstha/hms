import { env } from "$env/dynamic/public";
import { createHospitalAuthClient } from "@hms/auth/client";

const apiBaseUrl = (env.PUBLIC_API_URL ?? "").trim() || undefined;

export const authClient = createHospitalAuthClient(apiBaseUrl);

export type AppSession = typeof authClient.$Infer.Session;
