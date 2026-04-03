import { Hono } from 'hono'

// TODO: Add IPD (Inpatient Department) routes
// Routes will follow: GET /, GET /:id, POST /, PUT /:id
// Covers: admissions, discharges, bed assignments, ward rounds

const router = new Hono()

export default router
