import { z } from "zod";
import { orgFeatures } from "@hms/db/schema";

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

export const orgFeatureSchema = z.enum(orgFeatures);

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: slugSchema,
  domain: z
    .string()
    .max(253)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/, "Invalid domain format")
    .optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  // slug is intentionally omitted — immutable after creation
  domain: z
    .string()
    .max(253)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/, "Invalid domain format")
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
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/, "Invalid domain format"),
});

export const grantFeatureSchema = z.object({
  feature: orgFeatureSchema,
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type OrgFeature = z.infer<typeof orgFeatureSchema>;
