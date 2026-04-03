import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);
export const appointmentTypeEnum = pgEnum("appointment_type", ["opd", "telemedicine"]);
export const userRoles = [
  "superadmin",
  "admin",
  "doctor",
  "nurse",
  "receptionist",
  "pharmacist",
  "lab_technician",
  "billing_staff",
] as const;
export const userRoleEnum = pgEnum("user_role", userRoles);

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugUniqueIdx: uniqueIndex("organizations_slug_unique").on(table.slug),
    createdAtIdx: index("organizations_created_at_idx").on(table.createdAt),
  }),
);

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

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().default(""),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull(),
    banned: boolean("banned").notNull().default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires", {
      withTimezone: true,
      mode: "string",
    }),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "restrict" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "restrict",
    }),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", {
      withTimezone: true,
      mode: "string",
    }),
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
    emailUniqueIdx: uniqueIndex("users_email_unique").on(table.email),
    tenantIdx: index("users_tenant_id_idx").on(table.tenantId),
    organizationIdx: index("users_organization_id_idx").on(table.organizationId),
    roleIdx: index("users_role_idx").on(table.role),
    activeIdx: index("users_is_active_idx").on(table.isActive),
    tenantScopeCheck: check(
      "users_tenant_scope_check",
      sql`(
        (role = 'superadmin' and tenant_id is null and organization_id is null)
        or
        (role <> 'superadmin' and tenant_id is not null and organization_id is not null)
      )`,
    ),
  }),
);

export const userSessions = pgTable(
  "user_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    revokedAt: timestamp("revoked_at", {
      withTimezone: true,
      mode: "string",
    }),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    impersonatedBy: text("impersonated_by"),
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
    tokenHashUniqueIdx: uniqueIndex("user_sessions_token_hash_unique").on(table.tokenHash),
    userIdx: index("user_sessions_user_id_idx").on(table.userId),
    expiresAtIdx: index("user_sessions_expires_at_idx").on(table.expiresAt),
    revokedAtIdx: index("user_sessions_revoked_at_idx").on(table.revokedAt),
    createdAtIdx: index("user_sessions_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("user_sessions_updated_at_idx").on(table.updatedAt),
  }),
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    providerId: text("provider_id").notNull(),
    accountId: text("account_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
      mode: "string",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
      mode: "string",
    }),
    scope: text("scope"),
    password: text("password"),
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
    providerAccountUniqueIdx: uniqueIndex("accounts_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
    userIdx: index("accounts_user_id_idx").on(table.userId),
    createdAtIdx: index("accounts_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("accounts_updated_at_idx").on(table.updatedAt),
  }),
);

export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
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
    identifierIdx: index("verifications_identifier_idx").on(table.identifier),
    expiresAtIdx: index("verifications_expires_at_idx").on(table.expiresAt),
    createdAtIdx: index("verifications_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("verifications_updated_at_idx").on(table.updatedAt),
  }),
);

export const patients = pgTable(
  "patients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
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
    tenantUhidUniqueIdx: uniqueIndex("patients_tenant_uhid_unique").on(table.tenantId, table.uhid),
    tenantIdx: index("patients_tenant_id_idx").on(table.tenantId),
    createdAtIdx: index("patients_created_at_idx").on(table.createdAt),
  }),
);

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

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
