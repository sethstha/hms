import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { appointmentStatusEnum, appointmentTypeEnum } from "./enums";
import { patients } from "./patients";
import { tenants } from "./tenants";
import { users } from "./users";

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    scheduledAt: timestamp("scheduled_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    status: appointmentStatusEnum("status").notNull().default("pending"),
    type: appointmentTypeEnum("type").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tenantIdx: index("appointments_tenant_id_idx").on(table.tenantId),
    patientIdx: index("appointments_patient_id_idx").on(table.patientId),
    doctorIdx: index("appointments_doctor_id_idx").on(table.doctorId),
    scheduledAtIdx: index("appointments_scheduled_at_idx").on(table.scheduledAt),
  }),
);

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
