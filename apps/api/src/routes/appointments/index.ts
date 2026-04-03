import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { appointments } from '@hms/api/db/schema'
import { authMiddleware } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import type { AppEnv } from '@hms/api/types'

const router = new Hono<AppEnv>()

router.use('*', authMiddleware, tenantMiddleware)

// ─── List ──────────────────────────────────────────────────────────────────────

router.get('/', async (c) => {
  const db = c.get('db')
  const user = c.get('user')!

  const results = user.tenantId
    ? await db.select().from(appointments).where(eq(appointments.tenantId, user.tenantId))
    : await db.select().from(appointments)

  return c.json({ data: results })
})

// ─── Get one ──────────────────────────────────────────────────────────────────

router.get('/:id', async (c) => {
  const db = c.get('db')
  const user = c.get('user')!
  const id = c.req.param('id')

  const [appointment] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1)

  if (!appointment) {
    return c.json({ error: 'Appointment not found.' }, 404)
  }

  if (user.role !== 'superadmin' && appointment.tenantId !== user.tenantId) {
    return c.json({ error: 'Forbidden.' }, 403)
  }

  return c.json({ data: appointment })
})

// ─── Create ───────────────────────────────────────────────────────────────────

const createSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  scheduledAt: z.string(),
  type: z.enum(['opd', 'telemedicine']),
  notes: z.string().optional(),
})

router.post('/', zValidator('json', createSchema), async (c) => {
  const db = c.get('db')
  const user = c.get('user')!
  const data = c.req.valid('json')

  if (!user.tenantId) {
    return c.json({ error: 'Your account has no tenant assigned.' }, 403)
  }

  const [appointment] = await db
    .insert(appointments)
    .values({ ...data, tenantId: user.tenantId, status: 'pending' })
    .returning()

  return c.json({ data: appointment }, 201)
})

// ─── Update ───────────────────────────────────────────────────────────────────

const updateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  scheduledAt: z.string().optional(),
  notes: z.string().optional(),
})

router.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const db = c.get('db')
  const user = c.get('user')!
  const id = c.req.param('id')
  const data = c.req.valid('json')

  const [existing] = await db
    .select({ tenantId: appointments.tenantId })
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1)

  if (!existing) {
    return c.json({ error: 'Appointment not found.' }, 404)
  }

  if (user.role !== 'superadmin' && existing.tenantId !== user.tenantId) {
    return c.json({ error: 'Forbidden.' }, 403)
  }

  const [updated] = await db
    .update(appointments)
    .set(data)
    .where(eq(appointments.id, id))
    .returning()

  return c.json({ data: updated })
})

// ─── Delete ───────────────────────────────────────────────────────────────────

router.delete('/:id', async (c) => {
  const db = c.get('db')
  const user = c.get('user')!
  const id = c.req.param('id')

  const [existing] = await db
    .select({ tenantId: appointments.tenantId })
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1)

  if (!existing) {
    return c.json({ error: 'Appointment not found.' }, 404)
  }

  if (user.role !== 'superadmin' && existing.tenantId !== user.tenantId) {
    return c.json({ error: 'Forbidden.' }, 403)
  }

  await db.delete(appointments).where(eq(appointments.id, id))

  return c.json({ success: true })
})

export default router
