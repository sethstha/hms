import { pgEnum } from "drizzle-orm/pg-core";

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
