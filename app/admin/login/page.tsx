"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      if (json.success && json.token) {
        sessionStorage.setItem("admin_token", json.token);
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#E8EDF5] via-[#F4F7FB] to-[#E8EDF5] font-sans">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#123C69]/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#1E56A0]/5 blur-3xl" />
      <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-[#123C69]/5 blur-3xl" />

      <div className="flex w-full max-w-5xl rounded-2xl bg-white shadow-2xl shadow-[#123C69]/15 overflow-hidden">
        <div className="hidden lg:flex w-[42%] relative flex-col bg-[#123C69]">
          <img
            src="/profile/profile4.jpeg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#123C69]/90 via-[#123C69]/75 to-[#0F2D4E]/95" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative z-10 flex flex-col justify-between min-h-full">
            <div className="p-10 pb-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-10 pt-0 mt-auto">
              <div className="mb-5 h-1 w-12 rounded-full bg-gradient-to-r from-white/30 to-transparent" />
              <h2 className="text-[1.75rem] font-bold text-white leading-[1.2] tracking-tight">
                Portal Administrator
              </h2>
              <p className="mt-3 text-[0.9rem] text-white/50 leading-relaxed max-w-xs font-light">
                Kelola dokumen, pantau permohonan, dan kelola layanan dalam satu dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[58%] flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-6 inline-flex items-center justify-center gap-6 rounded-xl bg-[#F4F7FB] px-6 py-4 ring-1 ring-[#D8E0EC]/40">
                <img src="/images/image.png" alt="Kemenkeu" className="h-14 w-auto object-contain" />
                <div className="h-14 w-px bg-[#D8E0EC]" />
                <img src="/images/kpknl-bogor.png" alt="KPKNL Bogor" className="h-14 w-auto object-contain" />
              </div>
              <h1 className="text-[1.35rem] font-bold text-[#123C69] tracking-tight">LOGIN ADMIN</h1>
              <p className="mt-1.5 text-sm text-slate-400">Masukkan password untuk melanjutkan</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-600">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-[#D8E0EC] bg-white px-4 py-3 pr-11 text-sm placeholder:text-slate-400 focus:border-[#1E56A0] focus:outline-none focus:ring-2 focus:ring-[#1E56A0]/10 transition-all duration-200"
                    placeholder="Masukkan password"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50/80 border border-red-100/60 px-4 py-2.5 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#123C69] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#123C69]/20 hover:bg-[#1E56A0] hover:shadow-xl hover:shadow-[#123C69]/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#D8E0EC]/40 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#1E56A0] transition-colors duration-200"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5m7-7l-7 7 7 7" />
                </svg>
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
