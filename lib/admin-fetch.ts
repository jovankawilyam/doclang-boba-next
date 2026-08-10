export function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const cookie = document.cookie.split("; ").find((part) => part.startsWith("admin_csrf="));
  const csrfToken = cookie?.slice("admin_csrf=".length);
  return {
    ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
  };
}
