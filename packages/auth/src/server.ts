import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";

import { createDb } from "@hms/db";
import { accounts, userSessions, users, verifications } from "@hms/db/schema";

type CreateBetterAuthOptions = {
  databaseUrl: string;
  baseURL: string;
  secret: string;
  trustedOrigins?: string[];
};

const authByConfig = new Map<string, unknown>();

const LOCAL_DEV_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];

const normalizeOrigins = (origins: string[]): string[] => {
  const unique = new Set<string>();

  for (const origin of origins) {
    const trimmedOrigin = origin.trim();
    if (!trimmedOrigin) {
      continue;
    }
    unique.add(trimmedOrigin);
  }

  return [...unique];
};

const normalizeBaseURL = (baseURL: string): string => baseURL.trim().replace(/\/+$/, "");

export const createBetterAuth = ({
  databaseUrl,
  baseURL,
  secret,
  trustedOrigins = [],
}: CreateBetterAuthOptions) => {
  const resolvedBaseURL = normalizeBaseURL(baseURL);
  const resolvedOrigins = normalizeOrigins([resolvedBaseURL, ...LOCAL_DEV_ORIGINS, ...trustedOrigins]);
  const configKey = `${databaseUrl}::${resolvedBaseURL}::${secret}::${resolvedOrigins.join(",")}`;
  const cached = authByConfig.get(configKey);

  if (cached) {
    return cached as ReturnType<typeof betterAuth>;
  }

  const db = createDb(databaseUrl);
  const auth = betterAuth({
    baseURL: resolvedBaseURL,
    basePath: "/api/v1/auth",
    secret,
    trustedOrigins: resolvedOrigins,
    advanced: {
      database: {
        generateId: () => crypto.randomUUID(),
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
    plugins: [admin()],
    session: {
      fields: {
        token: "tokenHash",
      },
    },
    user: {
      additionalFields: {
        tenantId: {
          type: "string",
          required: false,
        },
        organizationId: {
          type: "string",
          required: false,
        },
        isActive: {
          type: "boolean",
          required: false,
          defaultValue: true,
          input: false,
        },
      },
    },
  });

  authByConfig.set(configKey, auth);
  return auth;
};
