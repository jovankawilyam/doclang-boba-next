"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, FileText, BookOpen, FileCheck, History, Settings, LogOut, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/kuitansi", label: "Kuitansi", icon: FileText },
  { href: "/admin/kutipan-rl", label: "Kutipan RL", icon: BookOpen },
  { href: "/admin/validasi-pph", label: "Validasi PPh", icon: FileCheck },
  { href: "/admin/riwayat", label: "Riwayat", icon: History },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    setCollapsed(localStorage.getItem("admin_sidebar_collapsed") === "true");
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("admin_token");
    router.push("/admin/login");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-3 z-50 rounded-lg border p-2 shadow-sm lg:hidden"
        style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" style={{ color: "var(--admin-text-secondary)" }} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "var(--admin-overlay)" }}
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col transition-all duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-16" : "w-64"}`}
        style={{ backgroundColor: "var(--admin-bg-sidebar)", borderRightColor: "var(--admin-border)", borderRightWidth: "1px" }}
      >
        <div className="flex items-center justify-between border-b px-3 py-4" style={{ borderColor: "var(--admin-border)" }}>
          <Link href="/admin" className="flex items-center justify-center gap-3">
            {collapsed ? (
              <Image src="/images/image.png" alt="Logo" width={1920} height={483} className="h-8 w-auto object-contain" />
            ) : (
              <Image src="/images/image.png" alt="Logo" width={1920} height={483} className="h-10 w-auto object-contain" />
            )}
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setCollapsed(!collapsed);
                if (typeof window !== "undefined") {
                  localStorage.setItem("admin_sidebar_collapsed", String(!collapsed));
                }
              }}
              className="hidden rounded-lg p-1.5 transition-colors hover:bg-[var(--admin-hover)] lg:block"
              style={{ color: "var(--admin-text-secondary)" }}
              aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 lg:hidden"
              style={{ color: "var(--admin-text-secondary)" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--admin-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg text-sm font-semibold transition-colors ${
                  collapsed ? "justify-center px-2 py-2.5" : "px-4 py-2.5"
                } ${active ? "text-white" : ""}`}
                style={{
                  backgroundColor: active ? "var(--admin-text-primary)" : "transparent",
                  color: active ? "#fff" : "var(--admin-text-secondary)",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "var(--admin-hover)";
                    e.currentTarget.style.color = "var(--admin-text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--admin-text-secondary)";
                  }
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t px-3 py-4" style={{ borderColor: "var(--admin-border)" }}>
          <div className={`mb-3 flex items-center gap-3 ${collapsed ? "justify-center px-0" : "px-4"}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: "var(--admin-text-primary)" }}>
              A
            </div>
            {!collapsed && (
              <div className="text-xs">
                <p className="font-bold" style={{ color: "var(--admin-text-body)" }}>Administrator</p>
                <p style={{ color: "var(--admin-text-secondary)" }}>KPKNL Bogor</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`mt-2 flex w-full items-center gap-3 rounded-lg text-sm font-semibold text-white transition-colors bg-red-500 hover:bg-red-700 hover:text-white ${
              collapsed ? "justify-center px-2 py-2.5" : "px-4 py-2.5"
            }`}
            title={collapsed ? "Keluar" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && "Keluar"}
          </button>
        </div>
      </aside>
    </>
  );
}
