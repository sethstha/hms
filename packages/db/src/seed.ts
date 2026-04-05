import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(__dirname, '../../../.env') })

import { hashPassword } from 'better-auth/crypto'
import { createDb } from './index'
import { organizations, tenants, users, accounts } from './schema'

// ─── Config ──────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL is not set. Add it to .env at the monorepo root.')
  process.exit(1)
}

const db = createDb(DATABASE_URL)
const DEMO_PASSWORD = 'Demo@1234'

const DEMO_ORG = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'City Care Hospital',
  slug: 'citycare',
}

const DEMO_TENANT = {
  id: '00000000-0000-0000-0000-000000000002',
  organizationId: DEMO_ORG.id,
  name: 'City Care Hospital',
  slug: 'citycare',
}

// Each entry maps to the userRoleEnum values in schema.ts.
// superadmin → no tenant/org (DB constraint: superadmin must have NULL tenant).
// All other roles → linked to DEMO_TENANT.
const DEMO_USERS: {
  id: string
  email: string
  name: string
  role: 'superadmin' | 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'lab_technician' | 'billing_staff'
  tenantId: string | null
  organizationId: string | null
}[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    email: 'superadmin@hms.internal',
    name: 'Platform Superadmin',
    role: 'superadmin',
    tenantId: null,
    organizationId: null,
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    email: 'admin@citycare.hms',
    name: 'Hospital Admin',
    role: 'admin',
    tenantId: DEMO_TENANT.id,
    organizationId: DEMO_ORG.id,
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    email: 'doctor@citycare.hms',
    name: 'Dr. Rajan Sharma',
    role: 'doctor',
    tenantId: DEMO_TENANT.id,
    organizationId: DEMO_ORG.id,
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    email: 'nurse@citycare.hms',
    name: 'Sunita Thapa',
    role: 'nurse',
    tenantId: DEMO_TENANT.id,
    organizationId: DEMO_ORG.id,
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    email: 'receptionist@citycare.hms',
    name: 'Priya Karki',
    role: 'receptionist',
    tenantId: DEMO_TENANT.id,
    organizationId: DEMO_ORG.id,
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    email: 'pharmacist@citycare.hms',
    name: 'Bikash Rai',
    role: 'pharmacist',
    tenantId: DEMO_TENANT.id,
    organizationId: DEMO_ORG.id,
  },
  {
    id: '10000000-0000-0000-0000-000000000007',
    email: 'lab@citycare.hms',
    name: 'Sanjay Gurung',
    role: 'lab_technician',
    tenantId: DEMO_TENANT.id,
    organizationId: DEMO_ORG.id,
  },
  {
    id: '10000000-0000-0000-0000-000000000008',
    email: 'billing@citycare.hms',
    name: 'Anita Shrestha',
    role: 'billing_staff',
    tenantId: DEMO_TENANT.id,
    organizationId: DEMO_ORG.id,
  },
]

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting seed...\n')

  // Hash once — all demo users share the same password
  console.log('🔐 Hashing demo password...')
  const passwordHash = await hashPassword(DEMO_PASSWORD)

  // 1. Organization
  console.log('🏥 Creating demo organization...')
  await db
    .insert(organizations)
    .values(DEMO_ORG)
    .onConflictDoNothing()

  // 2. Tenant
  console.log('🏥 Creating demo tenant...')
  await db
    .insert(tenants)
    .values(DEMO_TENANT)
    .onConflictDoNothing()

  // 3. Users + accounts
  console.log('\n👥 Creating demo users...')
  for (const demoUser of DEMO_USERS) {
    await db
      .insert(users)
      .values({
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        emailVerified: true,
        // BetterAuth uses accounts.password for sign-in verification.
        // passwordHash is a custom HMS field — set to the same value.
        passwordHash,
        role: demoUser.role,
        tenantId: demoUser.tenantId,
        organizationId: demoUser.organizationId,
        isActive: true,
      })
      .onConflictDoNothing()

    // BetterAuth credential account: providerId='credential', accountId=userId
    await db
      .insert(accounts)
      .values({
        id: `a${demoUser.id.slice(1)}`,
        providerId: 'credential',
        accountId: demoUser.id,
        userId: demoUser.id,
        password: passwordHash,
      })
      .onConflictDoNothing()

    console.log(`  ✓ ${demoUser.email} (${demoUser.role})`)
  }

  console.log('\n✅ Seed complete\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('DEMO CREDENTIALS  (password for all: Demo@1234)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\nAdmin App  (localhost:5174)')
  console.log('  superadmin@hms.internal    Platform Superadmin')
  console.log('\nHospital App  (localhost:5173)')
  console.log('  admin@citycare.hms         Hospital Admin')
  console.log('  doctor@citycare.hms        Doctor')
  console.log('  nurse@citycare.hms         Nurse')
  console.log('  receptionist@citycare.hms  Receptionist')
  console.log('  pharmacist@citycare.hms    Pharmacist')
  console.log('  lab@citycare.hms           Lab Technician')
  console.log('  billing@citycare.hms       Billing Staff')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
