"use client";

import { ToastContainer, useToast } from "@/components/toast";
import { Shield, Info } from "lucide-react";

export default function PengaturanPage() {
  const { toasts, dismiss } = useToast();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--admin-text-primary)" }}>Pengaturan</h1>
        <p className="mt-1 text-xs" style={{ color: "var(--admin-text-secondary)" }}>Informasi sistem dan konfigurasi panel admin</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border shadow-sm" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}>
          <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: "var(--admin-border)" }}>
            <Shield className="h-5 w-5" style={{ color: "var(--admin-text-primary)" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--admin-text-primary)" }}>Keamanan</h2>
          </div>
          <div className="p-6">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold text-amber-800">
                Password admin dikelola melalui environment variable <code className="rounded bg-amber-100 px-1">ADMIN_PASSWORD</code>.
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Hubungi administrator server untuk mengubah password.
              </p>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--admin-text-secondary)" }}>Autentikasi</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Aktif
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--admin-text-secondary)" }}>Sesi Login</span>
                <span className="font-semibold" style={{ color: "var(--admin-text-body)" }}>Session Storage</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border shadow-sm" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}>
          <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: "var(--admin-border)" }}>
            <Info className="h-5 w-5" style={{ color: "var(--admin-text-primary)" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--admin-text-primary)" }}>Informasi Sistem</h2>
          </div>
          <div className="space-y-3 p-6">
            <div className="flex justify-between text-xs">
              <span style={{ color: "var(--admin-text-secondary)" }}>Versi Aplikasi</span>
              <span className="font-semibold" style={{ color: "var(--admin-text-body)" }}>1.0.0</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: "var(--admin-text-secondary)" }}>Framework</span>
              <span className="font-semibold" style={{ color: "var(--admin-text-body)" }}>Next.js 16</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: "var(--admin-text-secondary)" }}>Database</span>
              <span className="font-semibold" style={{ color: "var(--admin-text-body)" }}>Google Sheets</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: "var(--admin-text-secondary)" }}>Status</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </>
  );
}
