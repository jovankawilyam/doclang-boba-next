"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { AdminSessionData } from "@/lib/admin-types";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: AdminSessionData["role"][];
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"] },
  { href: "/admin/kuitansi", label: "Kuitansi", icon: FileText, roles: ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"] },
  { href: "/admin/kutipan-rl", label: "Kutipan RL", icon: BookOpen, roles: ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"] },
  { href: "/admin/validasi-pph", label: "Validasi PPh", icon: FileCheck, roles: ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"] },
  { href: "/admin/riwayat", label: "Riwayat", icon: History, roles: ["superadmin", "kepala_kantor", "kepala_bagian"] },
  { href: "/admin/sampah", label: "Sampah", icon: Trash2, roles: ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"] },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings, roles: ["superadmin", "kepala_kantor", "kepala_bagian"] },
  { href: "/admin/admin-akun", label: "Admin Akun", icon: Users, roles: ["superadmin"] },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [admin, setAdmin] = useState<AdminSessionData | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    setCollapsed(localStorage.getItem("admin_sidebar_collapsed") === "true");
  }, []);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.authenticated) {
          setAdmin(json.admin ?? null);
        }
      })
      .catch(() => {});
  }, []);

  function handleLogout() {
    fetch("/api/admin/auth", { method: "DELETE" }).finally(() => {
      router.push("/admin/login");
    });
  }

  function handleChangePassword() {
    router.push("/admin/admin-akun?change-password=1");
  }

  const visibleItems = admin ? NAV_ITEMS.filter((item) => item.roles.includes(admin.role)) : NAV_ITEMS.filter((item) => item.href === "/admin");

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
        className={`fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col transition-all duration-300 lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "w-16" : "w-64"}`}
        style={{ backgroundColor: "var(--admin-bg-sidebar)", borderRightColor: "var(--admin-border)", borderRightWidth: "1px" }}
      >
        <div className="flex items-center justify-between border-b px-3 py-4" style={{ borderColor: "var(--admin-border)" }}>
          <Link href="/admin" className="flex items-center justify-center gap-3">
            {collapsed ? (
              <Image src="/images/image.png" alt="Logo" width={1920} height={483} sizes="120px" className="h-8 w-auto object-contain" />
            ) : (
              <Image src="/images/image.png" alt="Logo" width={1920} height={483} sizes="160px" className="h-10 w-auto object-contain" />
            )}
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const next = !collapsed;
                setCollapsed(next);
                if (typeof window !== "undefined") {
                  localStorage.setItem("admin_sidebar_collapsed", String(next));
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
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg text-sm font-semibold transition-colors ${collapsed ? "justify-center px-2 py-2.5" : "px-4 py-2.5"} ${active ? "text-white" : ""}`}
                style={{
                  backgroundColor: active ? "var(--admin-text-primary)" : "transparent",
                  color: active ? "#fff" : "var(--admin-text-secondary)",
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
              {admin?.name?.[0] ?? "A"}
            </div>
            {!collapsed && (
              <div className="text-xs">
                <p className="font-bold uppercase" style={{ color: "var(--admin-text-body)" }}>{admin?.name ?? "Administrator"}</p>
                <p style={{ color: "var(--admin-text-secondary)" }}>{admin?.role === "karyawan" ? "staf" : admin?.role ?? "-"}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleChangePassword}
            className={`mb-2 flex w-full items-center gap-3 rounded-lg border text-sm font-semibold transition-colors hover:bg-[var(--admin-hover)] ${collapsed ? "justify-center px-2 py-2.5" : "px-4 py-2.5"}`}
            style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-secondary)" }}
            title={collapsed ? "Ubah password" : undefined}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && "Ubah Password"}
          </button>
          <button
            onClick={handleLogout}
            className={`mt-2 flex w-full items-center gap-3 rounded-lg bg-red-500 text-sm font-semibold text-white transition-colors hover:bg-red-700 hover:text-white ${collapsed ? "justify-center px-2 py-2.5" : "px-4 py-2.5"}`}
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
