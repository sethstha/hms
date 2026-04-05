import { env } from "$env/dynamic/public";
import { createAdminAuthClient } from "@hms/auth/client";

const apiBaseUrl = (env.PUBLIC_API_URL ?? "").trim() || undefined;

export const authClient = createAdminAuthClient(apiBaseUrl);

export type AppSession = typeof authClient.$Infer.Session;
