"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { ThemeProvider } from "@/lib/theme-provider";
import { canAccessAdminPath, type AdminSessionData } from "@/lib/admin-types";
import { AdminSessionProvider } from "./admin-session-context";

export function ProtectedShell({
  admin,
  children,
}: {
  admin: AdminSessionData;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (admin.mustChangePassword && pathname !== "/admin/ubah-password") {
      router.replace("/admin/ubah-password?force=1");
      return;
    }
    if (!canAccessAdminPath(admin.role, pathname)) {
      router.replace("/admin");
    }
  }, [admin, pathname, router]);

  if (admin.mustChangePassword && pathname !== "/admin/ubah-password") {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--admin-bg)" }}>
        <div className="text-sm font-medium" style={{ color: "var(--admin-text-secondary)" }}>
          Mengarahkan ke Ubah Password...
        </div>
      </div>
    );
  }

  if (!canAccessAdminPath(admin.role, pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--admin-bg)" }}>
        <div className="text-sm font-medium" style={{ color: "var(--admin-text-secondary)" }}>
          Mengalihkan...
        </div>
      </div>
    );
  }

  return (
    <AdminSessionProvider admin={admin}>
      <ThemeProvider>
        <div className="flex min-h-screen" style={{ backgroundColor: "var(--admin-bg)" }}>
          <AdminSidebar />
          <main className="flex-1 overflow-x-auto lg:pl-0">
            <div className="px-4 py-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </ThemeProvider>
    </AdminSessionProvider>
  );
}
