import type { AppType } from "@hms/api";
import { hc, type ClientRequestOptions } from "hono/client";

// Extract the API root type cleanly
type RootClient = ReturnType<typeof hc<AppType>>;

export function createApiClient(baseUrl: string, options?: ClientRequestOptions): RootClient {
  return hc<AppType>(baseUrl, options);
}
