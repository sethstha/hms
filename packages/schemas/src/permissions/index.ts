import { z } from "zod";

export const permissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdBy: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createPermissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  // Slug: lowercase alphanumeric with hyphens or underscores. Immutable after creation.
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(63, "Slug must be at most 63 characters")
    .regex(
      /^[a-z0-9][a-z0-9_-]*[a-z0-9]$/,
      "Slug must be lowercase alphanumeric with hyphens or underscores",
    ),
  description: z.string().max(500).optional(),
});

export const updatePermissionSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  // slug is intentionally omitted — immutable after creation
  description: z.string().max(500).nullable().optional(),
});

export const permissionSlugCheckSchema = z.object({
  slug: z.string(),
});

export type Permission = z.infer<typeof permissionSchema>;
export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
