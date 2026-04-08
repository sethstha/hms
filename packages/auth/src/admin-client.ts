import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";
import { AUTH_BASE_PATHS } from "./paths.js";

export const createAdminAuthClient = (baseURL?: string) =>
  createAuthClient({
    baseURL,
    basePath: AUTH_BASE_PATHS.admin,
    plugins: [adminClient()],
  });
