export type TenantContext = {
  id: string;
  organizationId: string | null;
};

export const getSession = async <T>(request: Request, apiUrl: string): Promise<T | null> => {
  const cookie = request.headers.get("cookie");
  if (!cookie) {
    return null;
  }

  const response = await fetch(`${apiUrl}/api/v1/auth/get-session`, {
    method: "GET",
    headers: {
      cookie,
      accept: "application/json",
    },
  }).catch(() => null);

  if (!response || !response.ok) {
    return null;
  }

  const payload = await response.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return payload as T;
};

export const readTenant = (session: unknown): TenantContext | null => {
  const user = (session as Record<string, unknown> | null)?.user as
    | Record<string, unknown>
    | undefined;
  if (!user) {
    return null;
  }

  const tenantId =
    typeof user.tenantId === "string" && user.tenantId.length > 0 ? user.tenantId : null;
  if (!tenantId) {
    return null;
  }

  const organizationId =
    typeof user.organizationId === "string" && user.organizationId.length > 0
      ? user.organizationId
      : null;

  return { id: tenantId, organizationId };
};
