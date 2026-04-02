// Navigation configuration for the admin app (internal platform admin)
// Covers: tenant management, billing plans, feature flags, system health

export type NavItem = {
  title: string
  href: string
  icon: string
  roles: string[]
  children?: NavItem[]
}

export const navItems: NavItem[] = []
