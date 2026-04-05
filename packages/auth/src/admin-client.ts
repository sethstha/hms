import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";

export const createAdminAuthClient = (baseURL?: string) =>
  createAuthClient({
    baseURL,
    basePath: "/auth/admin",
    plugins: [adminClient()],
  });
