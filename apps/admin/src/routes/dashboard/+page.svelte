<script lang="ts">
  import { Badge, Card, Avatar, Separator } from "@hms/ui";

  const stats = [
    {
      label: "Organizations",
      value: "12",
      change: "+2 this month",
      trend: "up",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/30",
    },
    {
      label: "Hospitals",
      value: "34",
      change: "31 active",
      trend: "up",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Total Users",
      value: "1,248",
      change: "+34 this week",
      trend: "up",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "Patients",
      value: "89.4k",
      change: "+1.2k this month",
      trend: "up",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  const recentOrganizations = [
    { name: "Sunrise Health Group", slug: "sunrise-health", hospitals: 4, users: 312, status: "active" },
    { name: "Metro Medical Network", slug: "metro-medical", hospitals: 6, users: 489, status: "active" },
    { name: "Valley Care Systems", slug: "valley-care", hospitals: 3, users: 221, status: "active" },
    { name: "Northern Clinics Ltd.", slug: "northern-clinics", hospitals: 2, users: 98, status: "inactive" },
    { name: "Pacific Health Alliance", slug: "pacific-health", hospitals: 5, users: 401, status: "active" },
  ];

  const recentHospitals = [
    { name: "Sunrise General Hospital", org: "Sunrise Health Group", patients: 4820, beds: 300, status: "active" },
    { name: "Metro City Medical Center", org: "Metro Medical Network", patients: 7203, beds: 500, status: "active" },
    { name: "Valley Regional Hospital", org: "Valley Care Systems", patients: 2901, beds: 180, status: "active" },
    { name: "Northern District Clinic", org: "Northern Clinics Ltd.", patients: 1054, beds: 60, status: "inactive" },
  ];

  const recentUsers = [
    { name: "Dr. Priya Sharma", email: "p.sharma@sunrise.hms", role: "doctor", org: "Sunrise Health Group", lastLogin: "2 min ago", initials: "PS" },
    { name: "James O'Brien", email: "j.obrien@metro.hms", role: "admin", org: "Metro Medical Network", lastLogin: "14 min ago", initials: "JO" },
    { name: "Anita Rao", email: "a.rao@valley.hms", role: "receptionist", org: "Valley Care Systems", lastLogin: "1 hr ago", initials: "AR" },
    { name: "Mark Liu", email: "m.liu@metro.hms", role: "pharmacist", org: "Metro Medical Network", lastLogin: "3 hr ago", initials: "ML" },
    { name: "Sarah Kimani", email: "s.kimani@sunrise.hms", role: "nurse", org: "Sunrise Health Group", lastLogin: "Yesterday", initials: "SK" },
  ];

  const roleColors: Record<string, string> = {
    superadmin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    admin: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    doctor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    nurse: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    receptionist: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    pharmacist: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    lab_technician: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    billing_staff: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  };

  const avatarColors = [
    "bg-violet-500", "bg-blue-500", "bg-emerald-500",
    "bg-orange-500", "bg-pink-500", "bg-teal-500",
  ];

  function avatarColor(i: number) {
    return avatarColors[i % avatarColors.length];
  }
</script>

<div class="space-y-6">
  <!-- Page heading -->
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-foreground">Overview</h1>
    <p class="mt-1 text-sm text-muted-foreground">
      System-wide summary across all organizations and hospitals.
    </p>
  </div>

  <!-- Stat cards -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {#each stats as stat}
      <Card.Root class="overflow-hidden">
        <Card.Content class="p-5">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p class="mt-1 text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
              <p class="mt-1 text-xs text-muted-foreground">{stat.change}</p>
            </div>
            <div class="{stat.bg} rounded-lg p-2.5">
              <svg class="h-5 w-5 {stat.color}" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d={stat.icon} />
              </svg>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    {/each}
  </div>

  <!-- Two-column section: Organizations + Hospitals -->
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Organizations -->
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between pb-3">
        <div>
          <Card.Title class="text-base">Organizations</Card.Title>
          <Card.Description>All registered hospital groups</Card.Description>
        </div>
        <Badge variant="secondary">12 total</Badge>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="divide-y">
          {#each recentOrganizations as org}
            <div class="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
              <div class="flex items-center gap-3 min-w-0">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold uppercase text-muted-foreground">
                  {org.slug.slice(0, 2).toUpperCase()}
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-foreground">{org.name}</p>
                  <p class="text-xs text-muted-foreground">{org.hospitals} hospitals · {org.users} users</p>
                </div>
              </div>
              <Badge class={org.status === "active"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}>
                {org.status}
              </Badge>
            </div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    <!-- Hospitals -->
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between pb-3">
        <div>
          <Card.Title class="text-base">Hospitals</Card.Title>
          <Card.Description>Recently registered tenants</Card.Description>
        </div>
        <Badge variant="secondary">34 total</Badge>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="divide-y">
          {#each recentHospitals as hospital}
            <div class="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
              <div class="flex items-center gap-3 min-w-0">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/30">
                  <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-foreground">{hospital.name}</p>
                  <p class="truncate text-xs text-muted-foreground">{hospital.org} · {hospital.beds} beds</p>
                </div>
              </div>
              <div class="flex shrink-0 flex-col items-end gap-1">
                <Badge class={hospital.status === "active"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}>
                  {hospital.status}
                </Badge>
                <span class="text-xs text-muted-foreground">{hospital.patients.toLocaleString()} patients</span>
              </div>
            </div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>
  </div>

  <!-- Recent Users -->
  <Card.Root>
    <Card.Header class="flex flex-row items-center justify-between pb-3">
      <div>
        <Card.Title class="text-base">Recent Users</Card.Title>
        <Card.Description>Latest activity across all tenants</Card.Description>
      </div>
      <Badge variant="secondary">1,248 total</Badge>
    </Card.Header>
    <Card.Content class="p-0">
      <div class="divide-y">
        {#each recentUsers as user, i}
          <div class="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
            <Avatar.Root class="h-8 w-8 shrink-0">
              <Avatar.Fallback class="{avatarColor(i)} text-xs font-semibold text-white">
                {user.initials}
              </Avatar.Fallback>
            </Avatar.Root>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p class="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div class="hidden shrink-0 text-xs text-muted-foreground sm:block">{user.org}</div>
            <Badge class="{roleColors[user.role] ?? ''} shrink-0 capitalize">
              {user.role.replace("_", " ")}
            </Badge>
            <div class="hidden shrink-0 text-right text-xs text-muted-foreground md:block">
              {user.lastLogin}
            </div>
          </div>
        {/each}
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Bottom: User role distribution -->
  <Card.Root>
    <Card.Header class="pb-3">
      <Card.Title class="text-base">User Role Distribution</Card.Title>
      <Card.Description>Breakdown across all hospitals</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {#each [
          { role: "Doctors", count: 89, pct: 35, color: "bg-blue-500" },
          { role: "Nurses", count: 143, pct: 56, color: "bg-teal-500" },
          { role: "Admins", count: 34, pct: 14, color: "bg-violet-500" },
          { role: "Receptionists", count: 67, pct: 27, color: "bg-yellow-500" },
          { role: "Pharmacists", count: 45, pct: 18, color: "bg-green-500" },
          { role: "Lab Techs", count: 38, pct: 15, color: "bg-orange-500" },
          { role: "Billing Staff", count: 29, pct: 12, color: "bg-pink-500" },
          { role: "Others", count: 11, pct: 4, color: "bg-zinc-400" },
        ] as item}
          <div class="rounded-lg border bg-card p-3">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-xs font-medium text-muted-foreground">{item.role}</span>
              <span class="text-sm font-bold text-foreground">{item.count}</span>
            </div>
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div class="{item.color} h-full rounded-full transition-all" style="width: {item.pct}%"></div>
            </div>
          </div>
        {/each}
      </div>
    </Card.Content>
  </Card.Root>
</div>
