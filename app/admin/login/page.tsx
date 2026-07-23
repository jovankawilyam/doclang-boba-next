"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (json.success) {
        sessionStorage.setItem("admin_auth", "true");
        router.push("/admin");
      } else {
        setError(json.error || "Password salah");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB] font-sans">
      <div className="w-full max-w-sm rounded-xl border border-[#D8E0EC] bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <img
            src="/images/image.png"
            alt="Logo"
            className="mx-auto mb-4 h-12 w-auto object-contain"
          />
          <h1 className="text-xl font-bold text-[#123C69]">Admin Panel</h1>
          <p className="mt-1 text-sm text-slate-500">Masukkan password untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[#C7D2E3] px-4 py-2.5 text-sm focus:border-[#1E56A0] focus:outline-none focus:ring-2 focus:ring-[#1E56A0]/20"
              placeholder="Masukkan password"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#123C69] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1E56A0] disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-[#1E56A0] hover:text-[#123C69] hover:underline">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
