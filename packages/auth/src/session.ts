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
