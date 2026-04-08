import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte";

export const createorganizationAuthClient = (baseURL?: string) =>
  createAuthClient({ baseURL, basePath: "/api/v1/auth" });

export const createAdminAuthClient = (baseURL?: string) =>
  createAuthClient({ baseURL, basePath: "/api/v1/auth", plugins: [adminClient()] });
