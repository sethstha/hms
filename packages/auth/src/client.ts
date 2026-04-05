import { createAuthClient } from "better-auth/svelte";
import { adminClient } from "better-auth/client/plugins";

export const createHospitalAuthClient = (baseURL?: string) =>
  createAuthClient({ baseURL, basePath: "/api/v1/auth" });

export const createAdminAuthClient = (baseURL?: string) =>
  createAuthClient({ baseURL, basePath: "/api/v1/auth", plugins: [adminClient()] });
