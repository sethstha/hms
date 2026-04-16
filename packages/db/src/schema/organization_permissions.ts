import { boolean, index, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { permissions } from "./permissions";
import { users } from "./users";

export const organizationPermissions = pgTable(
  "organization_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    // the superadmin who granted this permission; set null if that user is deleted
    grantedBy: uuid("granted_by").references(() => users.id, { onDelete: "set null" }),
    grantedAt: timestamp("granted_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    canCreate: boolean("can_create").notNull().default(true),
    canRead: boolean("can_read").notNull().default(true),
    canUpdate: boolean("can_update").notNull().default(true),
    canDelete: boolean("can_delete").notNull().default(true),
  },
  (table) => ({
    // one row per permission per org — insert = grant, delete = revoke
    orgPermissionUniqueIdx: uniqueIndex("org_permissions_org_permission_unique").on(
      table.organizationId,
      table.permissionId,
    ),
    orgIdx: index("org_permissions_org_id_idx").on(table.organizationId),
    permissionIdx: index("org_permissions_permission_id_idx").on(table.permissionId),
    grantedByIdx: index("org_permissions_granted_by_idx").on(table.grantedBy),
  }),
);

export type OrganizationPermission = typeof organizationPermissions.$inferSelect;
export type NewOrganizationPermission = typeof organizationPermissions.$inferInsert;
