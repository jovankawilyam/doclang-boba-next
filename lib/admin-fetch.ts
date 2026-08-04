import { ADMIN_SESSION_HEADER } from "@/lib/admin-types";

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const cookie = document.cookie.split("; ").find((part) => part.startsWith("admin_csrf="));
  const csrfToken = cookie?.slice("admin_csrf=".length);
  const sessionToken = window.localStorage.getItem("admin_session_token");
  return {
    ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
    ...(sessionToken ? { [ADMIN_SESSION_HEADER]: sessionToken } : {}),
  };
}
