import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import patients from './routes/patients'
import appointments from './routes/appointments'
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

const app = new Hono()

// Global middleware
app.use('*', logger())
app.use('*', cors())

// Health check
app.get('/health', (c) => c.json({ status: 'ok', version: '1.0.0' }))

// API v1 routes
const v1 = new Hono()
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
