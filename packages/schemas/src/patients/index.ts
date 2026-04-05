import { z } from "zod";

export const patientSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  uhid: z.string(),
  name: z.string().min(1),
  dateOfBirth: z.string(),
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  createdAt: z.string(),
});

export const createPatientSchema = z.object({
  uhid: z.string().min(1),
  name: z.string().min(1),
  dateOfBirth: z.string(),
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

export type Patient = z.infer<typeof patientSchema>;
export type CreatePatient = z.infer<typeof createPatientSchema>;
export type UpdatePatient = z.infer<typeof updatePatientSchema>;
