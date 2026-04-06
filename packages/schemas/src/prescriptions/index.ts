import { z } from "zod";

export const medicationSchema = z.object({
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  route: z.enum(["oral", "iv", "im", "topical", "inhalation", "other"]).optional(),
});

export const prescriptionSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  consultationId: z.string().uuid(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  medications: z.array(medicationSchema),
  instructions: z.string().optional(),
  dispensed: z.boolean(),
  createdAt: z.string(),
});

export const createPrescriptionSchema = z.object({
  consultationId: z.string().uuid(),
  patientId: z.string().uuid(),
  medications: z.array(medicationSchema).min(1),
  instructions: z.string().optional(),
});

export type Medication = z.infer<typeof medicationSchema>;
export type Prescription = z.infer<typeof prescriptionSchema>;
export type CreatePrescription = z.infer<typeof createPrescriptionSchema>;
