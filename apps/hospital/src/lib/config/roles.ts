// Role constants for the hospital app
// Used for route guards, nav filtering, and permission checks

export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  RECEPTIONIST: 'receptionist',
  PHARMACIST: 'pharmacist',
  LAB_TECHNICIAN: 'lab_technician',
  BILLING_STAFF: 'billing_staff',
  PATIENT: 'patient',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]
