import { z } from "zod";

// Slugs become subdomains: {slug}.yoursaas.com
// Rules: 3-63 chars, lowercase alphanumeric + hyphens, no leading/trailing hyphen
export const slugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(63, "Slug must be at most 63 characters")
  .regex(
    /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
    "Slug must be lowercase alphanumeric with hyphens, and cannot start or end with a hyphen",
  );

// Blocked at the API layer — these are platform-reserved subdomains
export const RESERVED_SLUGS = [
  "api",
  "www",
  "admin",
  "app",
  "docs",
  "health",
  "internal",
  "static",
  "assets",
  "auth",
  "mail",
  "support",
  "help",
] as const;

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: slugSchema,
  domain: z
    .string()
    .max(253)
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/,
      "Invalid domain format",
    )
    .optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  // slug is intentionally omitted — immutable after creation
  domain: z
    .string()
    .max(253)
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/,
      "Invalid domain format",
    )
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
});

export const slugCheckSchema = z.object({
  slug: slugSchema,
});

export const domainCheckSchema = z.object({
  domain: z
    .string()
    .max(253)
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/,
      "Invalid domain format",
    ),
});

// ─── Organization Permission schemas ──────────────────────────────────────────

// Nested permission info returned alongside an org permission assignment
const nestedPermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

// Full response shape for an org permission assignment
export const orgPermissionSchema = z.object({
  id: z.string(),
  permissionId: z.string(),
  permission: nestedPermissionSchema,
  canCreate: z.boolean(),
  canRead: z.boolean(),
  canUpdate: z.boolean(),
  canDelete: z.boolean(),
  grantedAt: z.string(),
  grantedBy: z.string().nullable(),
});

// Body for granting or updating CRUD settings for a permission assignment
export const upsertPermissionSchema = z.object({
  canCreate: z.boolean().default(true),
  canRead: z.boolean().default(true),
  canUpdate: z.boolean().default(true),
  canDelete: z.boolean().default(true),
});

// Body for granting a new permission to an org
export const grantPermissionSchema = z.object({
  permissionId: z.string().uuid("Must be a valid permission ID"),
});

// Body for batch-updating all permission grants for an org in one request
export const batchUpsertPermissionsSchema = z.array(
  z.object({
    permissionId: z.string().uuid(),
    canCreate: z.boolean().default(false),
    canRead: z.boolean().default(false),
    canUpdate: z.boolean().default(false),
    canDelete: z.boolean().default(false),
  }),
);

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type OrgPermission = z.infer<typeof orgPermissionSchema>;
export type UpsertPermissionInput = z.infer<typeof upsertPermissionSchema>;
export type GrantPermissionInput = z.infer<typeof grantPermissionSchema>;
export type BatchUpsertPermissionsInput = z.infer<typeof batchUpsertPermissionsSchema>;
