import { createAdminAuth, createOrgAuth } from "@hms/auth";
import type { AppEnv } from "@hms/auth/types";
import { createDb } from "@hms/db";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { sql } from "drizzle-orm";
import { basicAuth } from "hono/basic-auth";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { dbMiddleware } from "./middleware/db";
import appointments from "./routes/appointments";
import billing from "./routes/billing";
import internal from "./routes/internal";
import inventory from "./routes/inventory";
import ipd from "./routes/ipd";
import laboratory from "./routes/laboratory";
import opd from "./routes/opd";
import organizations from "./routes/organizations";
import permissions from "./routes/permissions";
import patients from "./routes/patients";
import pharmacy from "./routes/pharmacy";
import radiology from "./routes/radiology";
import reports from "./routes/reports";
import staff from "./routes/staff";

const app = new OpenAPIHono<AppEnv>();

const LOCAL_DEV_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];

// Global middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const trustedOrigins = (c.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
        .split(",")
        .map((value: string) => value.trim())
        .filter((value: string) => value.length > 0);
      const allowedOrigins = [...new Set([...LOCAL_DEV_ORIGINS, ...trustedOrigins])];

      if (!origin) return null;

      return allowedOrigins.includes(origin) ? origin : null;
    },
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "HEAD", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

// Health check
app.get("/health", (c) => c.json({ status: "ok", version: "1.0.0" }));
app.get("/health/db", async (c) => {
  try {
    const databaseUrl = c.env.DATABASE_URL;

    if (!databaseUrl) {
      return c.json({ status: "error", database: "missing_database_url" }, 500);
    }

    const db = createDb(databaseUrl);
    await db.execute(sql`select 1`);

    return c.json({ status: "ok", database: "connected" });
  } catch (error) {
    return c.json(
      {
        status: "error",
        database: "unreachable",
        message: error instanceof Error ? error.message : "Unknown database error",
      },
      500,
    );
  }
});

// Database middleware
app.use("/api/*", dbMiddleware);
app.use("/internal/*", dbMiddleware);

// ─── Auth handlers ─────────────────────────────────────────────────────────────
const getAuthEnv = (c: { env: AppEnv["Bindings"] }) => ({
  databaseUrl: c.env.DATABASE_URL ?? "",
  secret: c.env.BETTER_AUTH_SECRET ?? "better-auth-dev-secret-change-me",
  baseURL: c.env.BETTER_AUTH_URL ?? "",
  trustedOrigins: (c.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((o: string) => o.trim())
    .filter(Boolean),
});

app.on(["GET", "POST"], "/auth/admin/*", (c) => {
  const auth = createAdminAuth(getAuthEnv(c));
  return auth.handler(c.req.raw);
});

app.on(["GET", "POST"], "/auth/organization/*", (c) => {
  const auth = createOrgAuth(getAuthEnv(c));
  return auth.handler(c.req.raw);
});

// ─── OpenAPI docs ─────────────────────────────────────────────────────────────
app.use("/docs", async (c, next) => {
  const username = c.env.DOCS_USERNAME;
  const password = c.env.DOCS_PASSWORD;

  if (!username || !password) {
    return c.text("Docs are not available.", 503);
  }

  return basicAuth({ username, password })(c, next);
});

app.use("/openapi.json", async (c, next) => {
  const username = c.env.DOCS_USERNAME;
  const password = c.env.DOCS_PASSWORD;

  if (!username || !password) {
    return c.text("Docs are not available.", 503);
  }

  return basicAuth({ username, password })(c, next);
});

app.get("/openapi.json", (c) => {
  try {
    const doc = app.getOpenAPIDocument({
      openapi: "3.0.0",
      info: {
        title: "HMS API",
        version: "1.0.0",
        description: "Hospital Management System API",
      },
      servers: [
        { url: "http://localhost:8787", description: "Development" },
        { url: "https://hms-api.sethstha.workers.dev", description: "Production" },
      ],
    });
    return c.json(doc);
  } catch (error) {
    console.error("[openapi] spec generation failed:", error);
    return c.json({ error: "OpenAPI spec generation failed", details: String(error) }, 500);
  }
});

app.get(
  "/docs",
  apiReference({
    url: "/openapi.json",
    theme: "default",
  }),
);

// ─── API v1 routes ─────────────────────────────────────────────────────────────
const routes = app
  .route("/api/v1/organizations", organizations)
  .route("/api/v1/permissions", permissions)
  .route("/api/v1/patients", patients)
  .route("/api/v1/appointments", appointments)
  .route("/api/v1/opd", opd)
  .route("/api/v1/ipd", ipd)
  .route("/api/v1/pharmacy", pharmacy)
  .route("/api/v1/billing", billing)
  .route("/api/v1/laboratory", laboratory)
  .route("/api/v1/radiology", radiology)
  .route("/api/v1/inventory", inventory)
  .route("/api/v1/staff", staff)
  .route("/api/v1/reports", reports)
  .route("/internal", internal);

export type AppType = typeof routes;
export default app;
