import type { AppEnv } from "@hms/auth/types";
import { createDb } from "@hms/db";
import { createMiddleware } from "hono/factory";

export const dbMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const databaseUrl = c.env.DATABASE_URL;

  if (!databaseUrl) {
    return c.json(
      {
        error: "DATABASE_URL is missing. Add your Neon connection URL to environment bindings.",
      },
      500,
    );
  }

  c.set("db", createDb(databaseUrl));
  c.set("user", null);
  c.set("session", null);
  c.set("tenant", null);
  await next();
});
