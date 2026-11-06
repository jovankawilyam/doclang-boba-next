"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { getAuthHeaders } from "@/lib/admin-fetch";
import { isValidAdminPassword, MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/password-policy";

export default function UbahPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isForced = searchParams.get("force") === "1";
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword.trim()) return setError("Password saat ini wajib diisi");
    if (!isValidAdminPassword(newPassword)) return setError(`Password baru minimal ${MIN_ADMIN_PASSWORD_LENGTH} karakter`);
    if (newPassword !== confirmPassword) return setError("Konfirmasi password tidak cocok");

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal mengubah password");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password berhasil diubah. Anda akan diarahkan ke halaman login.");
      window.setTimeout(() => router.replace("/admin/login"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--admin-text-primary)" }}>Ubah Password</h1>
        <p className="mt-1 text-xs" style={{ color: "var(--admin-text-secondary)" }}>
          Ganti password akun admin Anda. Setelah berhasil, semua sesi akan berakhir dan Anda harus login ulang.
        </p>
      </div>

      {isForced && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800">
          Anda menggunakan password sementara. Anda wajib mengganti password terlebih dahulu sebelum dapat mengakses halaman lain.
        </div>
      )}

      {(message || error) && (
        <div
          role="alert"
          className={`rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
        >
          {error || message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border p-6 shadow-sm"
        style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: "var(--admin-hover)" }}>
            <KeyRound className="h-5 w-5" style={{ color: "var(--admin-text-primary)" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--admin-text-body)" }}>Keamanan akun</p>
            <p className="text-xs" style={{ color: "var(--admin-text-secondary)" }}>Gunakan minimal {MIN_ADMIN_PASSWORD_LENGTH} karakter.</p>
          </div>
        </div>

        <label className="grid gap-1.5 text-xs font-semibold" style={{ color: "var(--admin-text-secondary)" }}>
          Password saat ini
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="rounded-lg border px-3 py-2.5 text-sm font-normal outline-none transition focus:border-slate-400"
            style={{ borderColor: "var(--admin-border-input)", backgroundColor: "var(--admin-bg)", color: "var(--admin-text-body)" }}
          />
        </label>

        <label className="grid gap-1.5 text-xs font-semibold" style={{ color: "var(--admin-text-secondary)" }}>
          Password baru
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
            className="rounded-lg border px-3 py-2.5 text-sm font-normal outline-none transition focus:border-slate-400"
            style={{ borderColor: "var(--admin-border-input)", backgroundColor: "var(--admin-bg)", color: "var(--admin-text-body)" }}
          />
        </label>

        <label className="grid gap-1.5 text-xs font-semibold" style={{ color: "var(--admin-text-secondary)" }}>
          Konfirmasi password baru
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            className="rounded-lg border px-3 py-2.5 text-sm font-normal outline-none transition focus:border-slate-400"
            style={{ borderColor: "var(--admin-border-input)", backgroundColor: "var(--admin-bg)", color: "var(--admin-text-body)" }}
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--admin-text-primary)" }}
          >
            {saving ? "Menyimpan..." : "Ubah Password"}
          </button>
          {!isForced && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:bg-[var(--admin-hover)]"
              style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-secondary)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
