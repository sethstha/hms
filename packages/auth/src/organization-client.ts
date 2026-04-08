import { createAuthClient } from "better-auth/client";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { AUTH_BASE_PATHS } from "./paths.js";

export const createOrgAuthClient = (baseURL?: string) =>
  createAuthClient({
    baseURL,
    basePath: AUTH_BASE_PATHS.organization,
    plugins: [organizationClient(), adminClient()],
  });
