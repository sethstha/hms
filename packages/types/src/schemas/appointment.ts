import { z } from 'zod'

export const appointmentSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  type: z.enum(['opd', 'telemedicine']),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
})

export type Appointment = z.infer<typeof appointmentSchema>
