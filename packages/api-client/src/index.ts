import type { AppType } from "@hms/api";
import { hc, type ClientRequestOptions } from "hono/client";

// Extract the API root type cleanly
type RootClient = ReturnType<typeof hc<AppType>>;

// Your final API client type
export type ApiClient = RootClient["api"]["v1"];

export function createApiClient(baseUrl: string, options?: ClientRequestOptions): ApiClient {
  const client = hc<AppType>(baseUrl, options);
  return client.api.v1;
}
