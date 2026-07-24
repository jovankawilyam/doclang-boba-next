"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FileText, BookOpen, FileCheck, History, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

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

  function handleLogout() {
    sessionStorage.removeItem("admin_auth");
    router.push("/admin/login");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-3 z-50 rounded-lg border border-[#D8E0EC] bg-white p-2 shadow-sm lg:hidden"
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5 text-slate-600" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-[#D8E0EC] transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#D8E0EC] px-5 py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <img src="/images/image.png" alt="Logo" className="h-10 w-auto object-contain" />
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
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
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[#123C69] text-white"
                    : "text-slate-600 hover:bg-[#F4F7FB] hover:text-[#123C69]"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#D8E0EC] px-3 py-4">
          <div className="mb-3 flex items-center gap-3 px-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#123C69] text-xs font-bold text-white">
              A
            </div>
            <div className="text-xs">
              <p className="font-bold text-slate-800">Administrator</p>
              <p className="text-slate-400">KPKNL Bogor</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors bg-red-500 hover:bg-red-700 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
