import { z } from 'zod'

export const consultationSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  diagnosis: z.string().optional(),
  chiefComplaint: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
})

export type Consultation = z.infer<typeof consultationSchema>
