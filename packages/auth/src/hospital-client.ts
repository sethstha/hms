import { createAuthClient } from "better-auth/client";
import { adminClient, organizationClient } from "better-auth/client/plugins";

export const createHospitalAuthClient = (baseURL?: string) =>
  createAuthClient({
    baseURL,
    basePath: "/auth/hospital",
    plugins: [organizationClient(), adminClient()],
  });
