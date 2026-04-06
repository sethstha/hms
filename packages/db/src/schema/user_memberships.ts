import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums";
import { organizations } from "./organizations";
import { users } from "./users";

export const userMemberships = pgTable(
  "user_memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    // org-level role — superadmin is platform-only and blocked by check constraint
    role: userRoleEnum("role").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // one role per user per org
    userOrgUniqueIdx: uniqueIndex("user_memberships_user_org_unique").on(
      table.userId,
      table.organizationId,
    ),
    userIdx: index("user_memberships_user_id_idx").on(table.userId),
    orgIdx: index("user_memberships_org_id_idx").on(table.organizationId),
    activeIdx: index("user_memberships_is_active_idx").on(table.isActive),
    // superadmins are platform-level — they must not be org members
    noSuperadminCheck: check(
      "user_memberships_no_superadmin",
      sql`role <> 'superadmin'`,
    ),
  }),
);

export type UserMembership = typeof userMemberships.$inferSelect;
export type NewUserMembership = typeof userMemberships.$inferInsert;
