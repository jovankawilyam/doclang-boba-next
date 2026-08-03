"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { ThemeProvider } from "@/lib/theme-provider";
import { getAuthHeaders } from "@/lib/admin-fetch";
import { canAccessAdminPath, type AdminSessionData } from "@/lib/admin-types";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [admin, setAdmin] = useState<AdminSessionData | null>(null);

  useEffect(() => {
    fetch("/api/admin/auth", { headers: getAuthHeaders() })
      .then((res) => res.json().then((json) => ({ res, json })))
      .then(({ json }) => {
        if (!json.success || !json.authenticated) {
          router.replace("/admin/login");
          return;
        }
        if (json.admin) {
          setAdmin(json.admin);
        }
        setAuthorized(true);
      })
      .catch(() => {
        router.replace("/admin/login");
      });
  }, [router]);

  useEffect(() => {
    if (!admin) return;
    const pathname = window.location.pathname;
    if (!canAccessAdminPath(admin.role, pathname)) {
      router.replace("/admin");
    }
  }, [admin, router]);

  if (authorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--admin-bg)" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: "var(--admin-border-input)", borderTopColor: "var(--admin-text-primary)" }} />
      </div>
    );
  }

  if (admin && !canAccessAdminPath(admin.role, window.location.pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--admin-bg)" }}>
        <div className="text-sm font-medium" style={{ color: "var(--admin-text-secondary)" }}>
          Mengalihkan...
        </div>
      </div>
    );
  }

  return (
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
  );
}
