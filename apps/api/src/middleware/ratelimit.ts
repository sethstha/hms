import { createMiddleware } from "hono/factory";

// TODO: Implement rate limiting using Cloudflare Rate Limiting or KV
// TODO: Key by tenant + IP or tenant + user
// TODO: Return 429 with Retry-After header when limit exceeded

export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  await next();
});
