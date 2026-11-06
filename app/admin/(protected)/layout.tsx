import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-types";
import { getAdminSession } from "@/lib/auth";
import { ProtectedShell } from "@/components/admin/protected-shell";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? null;
  const admin = await getAdminSession(token);

  if (!admin) {
    redirect("/admin/login");
  }

  return <ProtectedShell admin={admin}>{children}</ProtectedShell>;
}
