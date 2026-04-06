import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    // slug is the subdomain segment: {slug}.yoursaas.com — immutable after creation
    slug: text("slug").notNull(),
    // optional custom domain, e.g. hms.apollo.com.np
    domain: text("domain"),
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
    slugUniqueIdx: uniqueIndex("organizations_slug_unique").on(table.slug),
    // domain uniqueness is enforced at DB level only when domain is non-null (handled in app layer)
    domainUniqueIdx: uniqueIndex("organizations_domain_unique").on(table.domain),
    activeIdx: index("organizations_is_active_idx").on(table.isActive),
    createdAtIdx: index("organizations_created_at_idx").on(table.createdAt),
  }),
);

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
