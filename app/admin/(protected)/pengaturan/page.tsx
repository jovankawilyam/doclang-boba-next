"use client";

import { ToastContainer, useToast } from "@/components/toast";
import { Shield, Info } from "lucide-react";

export default function PengaturanPage() {
  const { toasts, dismiss } = useToast();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#123C69]">Pengaturan</h1>
        <p className="mt-1 text-xs text-slate-500">Informasi sistem dan konfigurasi panel admin</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#D8E0EC] bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#D8E0EC] px-6 py-4">
            <Shield className="h-5 w-5 text-[#123C69]" />
            <h2 className="text-sm font-bold text-[#123C69]">Keamanan</h2>
          </div>
          <div className="p-6">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-xs font-semibold text-amber-800">
                Password admin dikelola melalui environment variable <code className="rounded bg-amber-100 px-1">ADMIN_PASSWORD</code>.
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Hubungi administrator server untuk mengubah password.
              </p>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Autentikasi</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Aktif
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Sesi Login</span>
                <span className="font-semibold text-slate-800">Session Storage</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#D8E0EC] bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#D8E0EC] px-6 py-4">
            <Info className="h-5 w-5 text-[#123C69]" />
            <h2 className="text-sm font-bold text-[#123C69]">Informasi Sistem</h2>
          </div>
          <div className="space-y-3 p-6">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Versi Aplikasi</span>
              <span className="font-semibold text-slate-800">1.0.0</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Framework</span>
              <span className="font-semibold text-slate-800">Next.js 16</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Database</span>
              <span className="font-semibold text-slate-800">Google Sheets</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Status</span>
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
