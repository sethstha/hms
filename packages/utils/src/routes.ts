export const adminRoutes = {
  login: "/login",
  dashboard: "/dashboard",
  organizations: {
    root: "/organizations",
    new: "/organizations/new",
    edit: (slug: string) => `/organizations/${slug}/edit`,
    permissions: (slug: string) => `/organizations/${slug}/permissions`,
  },
  permissions: {
    root: "/permissions",
    new: "/permissions/new",
    edit: (id: string | number) => `/permissions/${id}/edit`,
  },
} as const;

// TODO: populate when apps/orgs routes are defined
export const orgRoutes = {} as const;
