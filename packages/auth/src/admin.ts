import { createDb } from "@hms/db";
import { accounts, users, userSessions, verifications } from "@hms/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, createAccessControl } from "better-auth/plugins";
import { AUTH_BASE_PATHS } from "./paths.js";

type CreateAdminAuthOptions = {
  databaseUrl: string;
  baseURL: string;
  secret: string;
  trustedOrigins?: string[];
};

// ─── Access control ────────────────────────────────────────────────────────────

export const adminAc = createAccessControl({
  user: ["create", "read", "update", "delete", "ban", "impersonate"],
  organization: ["create", "read", "update", "delete"],
});

export const superadminRole = adminAc.newRole({
  user: ["create", "read", "update", "delete", "ban", "impersonate"],
  organization: ["create", "read", "update", "delete"],
});

export const adminRole = adminAc.newRole({
  user: ["create", "read", "update", "ban"],
  organization: ["read", "update"],
});

export const supportRole = adminAc.newRole({
  user: ["read"],
  organization: ["read"],
});

// ─── Instance cache ─────────────────────────────────────────────────────────────

const cache = new Map<string, ReturnType<typeof betterAuth>>();

const normalizeOrigins = (origins: string[]): string[] => [
  ...new Set(origins.map((o) => o.trim()).filter(Boolean)),
];

const normalizeBaseURL = (url: string): string => url.trim().replace(/\/+$/, "");

// ─── Factory ────────────────────────────────────────────────────────────────────

export const createAdminAuth = ({
  databaseUrl,
  baseURL,
  secret,
  trustedOrigins = [],
}: CreateAdminAuthOptions): ReturnType<typeof betterAuth> => {
  const resolvedBaseURL = normalizeBaseURL(baseURL);
  const LOCAL_DEV_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];
  const resolvedOrigins = normalizeOrigins([
    resolvedBaseURL,
    ...LOCAL_DEV_ORIGINS,
    ...trustedOrigins,
  ]);
  const cacheKey = `${databaseUrl}::${resolvedBaseURL}::${secret}::${resolvedOrigins.join(",")}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const db = createDb(databaseUrl);
  const auth = betterAuth({
    baseURL: resolvedBaseURL,
    basePath: AUTH_BASE_PATHS.admin,
    secret,
    trustedOrigins: resolvedOrigins,
    advanced: {
      database: { generateId: () => crypto.randomUUID() },
      cookies: {
        session_token: {
          attributes: {
            sameSite: "none",
            secure: true,
          },
        },
      },
    },
    database: drizzleAdapter(db, {
      provider: "pg",
      camelCase: true,
      schema: {
        user: users,
        session: userSessions,
        account: accounts,
        verification: verifications,
      },
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
    },
    plugins: [
      admin({
        ac: adminAc,
        roles: {
          superadmin: superadminRole,
          admin: adminRole,
          support: supportRole,
        },
      }),
    ],
    session: {
      fields: { token: "tokenHash" },
    },
    user: {
      additionalFields: {
        isActive: { type: "boolean", required: false, defaultValue: true, input: false },
      },
    },
  });

  const result = auth as ReturnType<typeof betterAuth>;
  cache.set(cacheKey, result);
  return result;
};
