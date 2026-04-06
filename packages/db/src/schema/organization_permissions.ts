import { index, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { orgFeatureEnum } from "./enums";
import { organizations } from "./organizations";
import { users } from "./users";

export const organizationPermissions = pgTable(
  "organization_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    feature: orgFeatureEnum("feature").notNull(),
    // the superadmin who granted this feature; set null if that user is deleted
    grantedBy: uuid("granted_by").references(() => users.id, { onDelete: "set null" }),
    grantedAt: timestamp("granted_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // one row per feature per org — insert = grant, delete = revoke
    orgFeatureUniqueIdx: uniqueIndex("org_permissions_org_feature_unique").on(
      table.organizationId,
      table.feature,
    ),
    orgIdx: index("org_permissions_org_id_idx").on(table.organizationId),
    grantedByIdx: index("org_permissions_granted_by_idx").on(table.grantedBy),
  }),
);

export type OrganizationPermission = typeof organizationPermissions.$inferSelect;
export type NewOrganizationPermission = typeof organizationPermissions.$inferInsert;
