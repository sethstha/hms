import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationSlugUniqueIdx: uniqueIndex("tenants_organization_slug_unique").on(
      table.organizationId,
      table.slug,
    ),
    organizationIdx: index("tenants_organization_id_idx").on(table.organizationId),
    activeIdx: index("tenants_is_active_idx").on(table.isActive),
    createdAtIdx: index("tenants_created_at_idx").on(table.createdAt),
  }),
);

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
