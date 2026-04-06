import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { genderEnum } from "./enums";
import { organizations } from "./organizations";

export const patients = pgTable(
  "patients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    uhid: text("uhid").notNull(),
    name: text("name").notNull(),
    dateOfBirth: timestamp("date_of_birth", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    gender: genderEnum("gender").notNull(),
    bloodGroup: text("blood_group"),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    orgUhidUniqueIdx: uniqueIndex("patients_org_uhid_unique").on(table.organizationId, table.uhid),
    orgIdx: index("patients_org_id_idx").on(table.organizationId),
    createdAtIdx: index("patients_created_at_idx").on(table.createdAt),
  }),
);

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
