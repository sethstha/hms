// Role constants for the admin app (platform-level roles)
// These are Anthropic/internal admin roles, not hospital staff roles

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  SUPPORT: 'support',
  BILLING_ADMIN: 'billing_admin',
  READ_ONLY: 'read_only',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]
