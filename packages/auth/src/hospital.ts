import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";

import { createDb } from "@hms/db";
import { accounts, userSessions, users, verifications } from "@hms/db/schema";

type CreateHospitalAuthOptions = {
  databaseUrl: string;
  baseURL: string;
  secret: string;
  trustedOrigins?: string[];
};

// ─── Instance cache ─────────────────────────────────────────────────────────────

const cache = new Map<string, ReturnType<typeof betterAuth>>();

const normalizeOrigins = (origins: string[]): string[] =>
  [...new Set(origins.map((o) => o.trim()).filter(Boolean))];

const normalizeBaseURL = (url: string): string => url.trim().replace(/\/+$/, "");

// ─── Factory ────────────────────────────────────────────────────────────────────

export const createHospitalAuth = ({
  databaseUrl,
  baseURL,
  secret,
  trustedOrigins = [],
}: CreateHospitalAuthOptions) => {
  const resolvedBaseURL = normalizeBaseURL(baseURL);
  const LOCAL_DEV_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];
  const resolvedOrigins = normalizeOrigins([resolvedBaseURL, ...LOCAL_DEV_ORIGINS, ...trustedOrigins]);
  const cacheKey = `${databaseUrl}::${resolvedBaseURL}::${secret}::${resolvedOrigins.join(",")}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const db = createDb(databaseUrl);
  const auth = betterAuth({
    baseURL: resolvedBaseURL,
    basePath: "/auth/hospital",
    secret,
    trustedOrigins: resolvedOrigins,
    advanced: { database: { generateId: () => crypto.randomUUID() } },
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
      // admin plugin handles ban/deactivate functionality for hospital users
      admin(),
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

  cache.set(cacheKey, auth);
  return auth;
};
