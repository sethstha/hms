import { z } from "zod";

export const patientSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  uhid: z.string(),
  name: z.string().min(1),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type Patient = z.infer<typeof patientSchema>;
