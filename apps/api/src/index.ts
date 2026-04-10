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
import patients from "./routes/patients";
import permissions from "./routes/permissions";
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
app.get("/health", async (c) => {
  const start = Date.now();

  // DB check
  let dbStatus: "connected" | "missing_url" | "unreachable" = "connected";
  let dbMessage: string | undefined;
  let dbLatencyMs: number | undefined;

  const databaseUrl = c.env.DATABASE_URL;

  if (!databaseUrl) {
    dbStatus = "missing_url";
  } else {
    try {
      const dbStart = Date.now();
      const db = createDb(databaseUrl);
      await db.execute(sql`select 1`);
      dbLatencyMs = Date.now() - dbStart;
    } catch (error) {
      dbStatus = "unreachable";
      dbMessage = error instanceof Error ? error.message : "Unknown error";
    }
  }

  const healthy = dbStatus === "connected";

  return c.json(
    {
      status: healthy ? "ok" : "degraded",
      version: "1.0.0",
      uptime: process.uptime?.() ?? null,
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - start,
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          ...(dbMessage && { message: dbMessage }),
        },
      },
    },
    healthy ? 200 : 503,
  );
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

const v1 = new OpenAPIHono<AppEnv>()
  .route("/organizations", organizations)
  .route("/permissions", permissions)
  .route("/patients", patients)
  .route("/appointments", appointments)
  .route("/opd", opd)
  .route("/ipd", ipd)
  .route("/pharmacy", pharmacy)
  .route("/billing", billing)
  .route("/laboratory", laboratory)
  .route("/radiology", radiology)
  .route("/inventory", inventory)
  .route("/staff", staff)
  .route("/reports", reports);

const routes = app.route("/api/v1", v1).route("/internal", internal).route("/internal", internal);

export type AppType = typeof routes;
export default routes;
