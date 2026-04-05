import { z } from "zod";

export const appointmentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  scheduledAt: z.string(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
  type: z.enum(["opd", "telemedicine"]),
  notes: z.string().nullable(),
  createdAt: z.string(),
});

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  scheduledAt: z.string(),
  type: z.enum(["opd", "telemedicine"]),
  notes: z.string().optional(),
});

export const updateAppointmentSchema = createAppointmentSchema
  .partial()
  .extend({ status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional() });

export type Appointment = z.infer<typeof appointmentSchema>;
export type CreateAppointment = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointment = z.infer<typeof updateAppointmentSchema>;
