import type { Db } from "@hms/db";
import type { Organization, User, UserMembership, UserSession } from "@hms/db/schema";

export type AuthenticatedUser = Pick<
  User,
  "id" | "email" | "role" | "isActive"
>;

export type AuthenticatedSession = Pick<
  UserSession,
  "id" | "userId" | "expiresAt" | "revokedAt" | "createdAt" | "ipAddress" | "userAgent"
>;

export type HonoOrgContext =
  | (Pick<Organization, "id" | "name" | "slug" | "isActive" | "domain"> & {
      // the requesting user's role within this org (from user_memberships)
      memberRole: UserMembership["role"];
    })
  | null;

export type AppBindings = {
  DATABASE_URL?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_TRUSTED_ORIGINS?: string;
  DOCS_USERNAME?: string;
  DOCS_PASSWORD?: string;
};

export type AppVariables = {
  db: Db;
  user: AuthenticatedUser | null;
  session: AuthenticatedSession | null;
  organization: HonoOrgContext;
};

export type AppEnv = {
  Bindings: AppBindings;
  Variables: AppVariables;
};
