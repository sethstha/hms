export const AUTH_BASE_PATHS = {
  admin: "/auth/admin",
  organization: "/auth/organization",
} as const;

export type AuthApp = keyof typeof AUTH_BASE_PATHS;
