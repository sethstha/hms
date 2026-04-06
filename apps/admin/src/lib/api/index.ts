import { createApiClient } from "@hms/api-client";
import { env } from "$env/dynamic/public";

export const api = createApiClient(env.PUBLIC_API_URL, {
  init: { credentials: "include" },
});

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly path: string,
  ) {
    super(`[${status}] ${path}: ${message}`);
    this.name = "ApiError";
  }
}
