import { z } from "zod";

export const consultationSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  diagnosis: z.string().optional(),
  chiefComplaint: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  createdAt: z.string(),
});

export const createConsultationSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  diagnosis: z.string().optional(),
  chiefComplaint: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
});

export const updateConsultationSchema = createConsultationSchema.partial();

export type Consultation = z.infer<typeof consultationSchema>;
export type CreateConsultation = z.infer<typeof createConsultationSchema>;
export type UpdateConsultation = z.infer<typeof updateConsultationSchema>;
