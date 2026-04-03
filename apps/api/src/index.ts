import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { sql } from 'drizzle-orm'

import patients from './routes/patients'
import appointments from './routes/appointments'
import auth from './routes/auth'
import opd from './routes/opd'
import ipd from './routes/ipd'
import pharmacy from './routes/pharmacy'
import billing from './routes/billing'
import laboratory from './routes/laboratory'
import radiology from './routes/radiology'
import inventory from './routes/inventory'
import staff from './routes/staff'
import reports from './routes/reports'
import internal from './routes/internal'
import { createDb } from '@hms/api/db'
import { dbMiddleware } from './middleware/db'
import type { AppEnv } from '@hms/api/types'

const app = new Hono<AppEnv>()

const LOCAL_DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:5174']

// Global middleware
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: (origin, c) => {
      const trustedOrigins = (c.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
        .split(',')
        .map((value: string) => value.trim())
        .filter((value: string) => value.length > 0)
      const allowedOrigins = [...new Set([...LOCAL_DEV_ORIGINS, ...trustedOrigins])]

      if (!origin) {
        return null
      }

      return allowedOrigins.includes(origin) ? origin : null
    },
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
)

// Health check
app.get('/health', (c) => c.json({ status: 'ok', version: '1.0.0' }))
app.get('/health/db', async (c) => {
  try {
    const databaseUrl = c.env.DATABASE_URL

    if (!databaseUrl) {
      return c.json({ status: 'error', database: 'missing_database_url' }, 500)
    }

    const db = createDb(databaseUrl)
    await db.execute(sql`select 1`)

    return c.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    return c.json(
      {
        status: 'error',
        database: 'unreachable',
        message: error instanceof Error ? error.message : 'Unknown database error',
      },
      500,
    )
  }
})

// Database middleware for API/Internal routes
app.use('/api/*', dbMiddleware)
app.use('/internal/*', dbMiddleware)

// API v1 routes
const v1 = new Hono<AppEnv>()
v1.route('/auth', auth)
v1.route('/patients', patients)
v1.route('/appointments', appointments)
v1.route('/opd', opd)
v1.route('/ipd', ipd)
v1.route('/pharmacy', pharmacy)
v1.route('/billing', billing)
v1.route('/laboratory', laboratory)
v1.route('/radiology', radiology)
v1.route('/inventory', inventory)
v1.route('/staff', staff)
v1.route('/reports', reports)

app.route('/api/v1', v1)

// Internal admin routes (no v1 prefix)
app.route('/internal', internal)

export default app
