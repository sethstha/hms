import { createAdminAuthClient } from "@hms/auth/admin-client";
import { env } from "$env/dynamic/public";

export const authClient = createAdminAuthClient(env.PUBLIC_API_URL);

export type AppSession = typeof authClient.$Infer.Session;
