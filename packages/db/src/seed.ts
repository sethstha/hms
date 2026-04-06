import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(__dirname, '../../../.env') })

import { hashPassword } from 'better-auth/crypto'
import { createDb } from './index'
import { accounts, organizationPermissions, organizations, userMemberships, users } from './schema/index'

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
  isActive: true,
}

// superadmin → platform-level user (no org membership)
// All other roles → members of DEMO_ORG with an org-level role
const DEMO_USERS: {
  id: string
  email: string
  name: string
  platformRole: 'superadmin' | 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'lab_technician' | 'billing_staff'
  orgRole?: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'lab_technician' | 'billing_staff'
}[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    email: 'superadmin@hms.internal',
    name: 'Platform Superadmin',
    platformRole: 'superadmin',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    email: 'admin@citycare.hms',
    name: 'Hospital Admin',
    platformRole: 'admin',
    orgRole: 'admin',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    email: 'doctor@citycare.hms',
    name: 'Dr. Rajan Sharma',
    platformRole: 'doctor',
    orgRole: 'doctor',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    email: 'nurse@citycare.hms',
    name: 'Sunita Thapa',
    platformRole: 'nurse',
    orgRole: 'nurse',
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    email: 'receptionist@citycare.hms',
    name: 'Priya Karki',
    platformRole: 'receptionist',
    orgRole: 'receptionist',
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    email: 'pharmacist@citycare.hms',
    name: 'Bikash Rai',
    platformRole: 'pharmacist',
    orgRole: 'pharmacist',
  },
  {
    id: '10000000-0000-0000-0000-000000000007',
    email: 'lab@citycare.hms',
    name: 'Sanjay Gurung',
    platformRole: 'lab_technician',
    orgRole: 'lab_technician',
  },
  {
    id: '10000000-0000-0000-0000-000000000008',
    email: 'billing@citycare.hms',
    name: 'Anita Shrestha',
    platformRole: 'billing_staff',
    orgRole: 'billing_staff',
  },
]

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting seed...\n')

  const passwordHash = await hashPassword(DEMO_PASSWORD)

  // 1. Organization
  console.log('🏥 Creating demo organization...')
  await db.insert(organizations).values(DEMO_ORG).onConflictDoNothing()

  // 2. Grant all features to demo org
  console.log('🔑 Granting all features to demo org...')
  const superadminId = '10000000-0000-0000-0000-000000000001'
  const allFeatures = ['pharmacy', 'opd', 'ipd', 'appointments', 'laboratory', 'radiology', 'inventory', 'billing', 'reports'] as const
  for (const feature of allFeatures) {
    await db
      .insert(organizationPermissions)
      .values({ organizationId: DEMO_ORG.id, feature, grantedBy: superadminId })
      .onConflictDoNothing()
  }

  // 3. Users + accounts + memberships
  console.log('\n👥 Creating demo users...')
  for (const demoUser of DEMO_USERS) {
    await db
      .insert(users)
      .values({
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        emailVerified: true,
        role: demoUser.platformRole,
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

    // Create org membership for non-superadmin users
    if (demoUser.orgRole) {
      await db
        .insert(userMemberships)
        .values({
          userId: demoUser.id,
          organizationId: DEMO_ORG.id,
          role: demoUser.orgRole,
          isActive: true,
        })
        .onConflictDoNothing()
    }

    console.log(`  ✓ ${demoUser.email} (${demoUser.platformRole})`)
  }

  console.log('\n✅ Seed complete\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('DEMO CREDENTIALS  (password for all: Demo@1234)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\nAdmin App  (localhost:5174)')
  console.log('  superadmin@hms.internal    Platform Superadmin')
  console.log('\nHospital App  (localhost:5173)  [x-org-id: ' + DEMO_ORG.id + ']')
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
