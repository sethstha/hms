// Navigation configuration for the hospital app
// Populate this array to drive the sidebar and top nav
// Role-based filtering is applied at render time using the roles field

export type NavItem = {
  title: string
  href: string
  icon: string
  roles: string[]
  children?: NavItem[]
}

export const navItems: NavItem[] = []
