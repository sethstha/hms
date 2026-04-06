import { z } from 'zod'

export const billingItemSchema = z.object({
  description: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  total: z.number().nonnegative(),
  category: z.enum(['consultation', 'procedure', 'medication', 'lab', 'radiology', 'room', 'other']).optional(),
})

export const billingSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  patientId: z.string().uuid(),
  visitId: z.string().uuid().optional(),
  items: z.array(billingItemSchema),
  totalAmount: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
  paidAmount: z.number().nonnegative().default(0),
  status: z.enum(['draft', 'pending', 'partial', 'paid', 'cancelled']),
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'insurance', 'other']).optional(),
  createdAt: z.string().datetime(),
})

export type BillingItem = z.infer<typeof billingItemSchema>
export type Billing = z.infer<typeof billingSchema>
