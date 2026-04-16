import { createHospitalAuthClient } from "@hms/auth/hospital-client";
import { env } from "$env/dynamic/public";

const apiBaseUrl = (env.PUBLIC_API_URL ?? "").trim() || undefined;

export const authClient = createHospitalAuthClient(apiBaseUrl);

export type AppSession = typeof authClient.$Infer.Session;
