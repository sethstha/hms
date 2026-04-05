import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, createAccessControl, organization } from "better-auth/plugins";

import { createDb } from "@hms/db";
import { accounts, userSessions, users, verifications } from "@hms/db/schema";

type CreateHospitalAuthOptions = {
  databaseUrl: string;
  baseURL: string;
  secret: string;
  trustedOrigins?: string[];
};

// ─── Access control ────────────────────────────────────────────────────────────

export const hospitalAc = createAccessControl({
  patient: ["create", "read", "update", "delete"],
  appointment: ["create", "read", "update", "delete"],
  prescription: ["create", "read", "update"],
  report: ["create", "read"],
  billing: ["create", "read", "update"],
});

export const managerRole = hospitalAc.newRole({
  patient: ["create", "read", "update", "delete"],
  appointment: ["create", "read", "update", "delete"],
  prescription: ["create", "read", "update"],
  report: ["create", "read"],
  billing: ["create", "read", "update"],
});

export const doctorRole = hospitalAc.newRole({
  patient: ["read", "update"],
  appointment: ["create", "read", "update"],
  prescription: ["create", "read", "update"],
  report: ["create", "read"],
  billing: ["read"],
});

export const nurseRole = hospitalAc.newRole({
  patient: ["read", "update"],
  appointment: ["read", "update"],
  prescription: ["read"],
  report: ["read"],
  billing: ["read"],
});

export const receptionistRole = hospitalAc.newRole({
  patient: ["create", "read"],
  appointment: ["create", "read", "update"],
  billing: ["create", "read", "update"],
});

export const staffRole = hospitalAc.newRole({
  patient: ["read"],
  appointment: ["read"],
  billing: ["read"],
});

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
      organization({
        ac: hospitalAc,
        roles: {
          manager: managerRole,
          doctor: doctorRole,
          nurse: nurseRole,
          receptionist: receptionistRole,
          staff: staffRole,
        },
      }),
      // Ban functionality for hospital users
      admin(),
    ],
    session: {
      fields: { token: "tokenHash" },
    },
    user: {
      additionalFields: {
        tenantId: { type: "string", required: false },
        organizationId: { type: "string", required: false },
        isActive: { type: "boolean", required: false, defaultValue: true, input: false },
      },
    },
  });

  cache.set(cacheKey, auth);
  return auth;
};
