"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogIn, Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [role, setRole] = useState("staf");
  const [unit, setUnit] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/admin");
      } else {
        setError(json.error || "Username atau password salah");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotLookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, role, unit }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Data tidak cocok");
        return;
      }
      setResetToken(json.data.token);
      setForgotStep(2);
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) return setError("Password minimal 8 karakter");
    if (newPassword !== confirmPassword) return setError("Konfirmasi password tidak cocok");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Gagal reset password");
        return;
      }
      setForgotOpen(false);
      setForgotStep(1);
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setPassword("");
      setError("Password berhasil diubah. Silakan login.");
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#E8EDF5] via-[#F4F7FB] to-[#E8EDF5] font-sans">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#005FAC]/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#3388CC]/5 blur-3xl" />
      <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-[#005FAC]/5 blur-3xl" />

      <div className="flex w-full max-w-5xl overflow-hidden rounded-[20px] bg-white shadow-2xl shadow-black/10">
        <div className="hidden w-[42%] flex-col bg-[#005FAC] lg:flex relative">
          <Image src="/profile/profile-login.JPG" alt="" fill className="object-cover object-[45%_70%]" sizes="42vw" priority={true} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/100" />
          <div className="relative z-10 flex min-h-full flex-col justify-between">
            <div className="p-10 pb-0" />
            <div className="p-10 pt-0 mt-auto">
              <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-white">Portal Administrator</h2>
              <p className="mt-3 max-w-xs text-[0.9rem] leading-relaxed text-white/50 font-light">Kelola dokumen, pantau permohonan, dan kelola layanan dalam satu dashboard.</p>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center p-8 lg:w-[58%] lg:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-6 inline-flex items-center justify-center gap-6 rounded-xl bg-[#F4F7FB] px-6 py-4 ring-1 ring-[#D8E0EC]/40">
                <Image src="/images/image.png" alt="Kemenkeu" width={1920} height={483} sizes="230px" className="h-14 w-auto object-contain" />
                <div className="h-14 w-px bg-[#D8E0EC]" />
                <Image src="/images/kpknl-bogor.png" alt="KPKNL Bogor" width={354} height={335} className="h-14 w-auto object-contain" />
              </div>
              <h1 className="text-[1.35rem] font-bold tracking-tight text-[#005FAC]">LOGIN ADMIN</h1>
              <p className="mt-1.5 text-sm text-slate-400">Masukkan username dan password untuk melanjutkan</p>
            </div>

            {!forgotOpen ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-600">Username</label>
                  <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1.5 block w-full rounded-xl border border-[#D8E0EC] bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:border-[#3388CC] focus:outline-none focus:ring-2 focus:ring-[#3388CC]/10 transition-all duration-200" placeholder="Masukkan username" autoComplete="username" required />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-600">Password</label>
                  <div className="relative mt-1.5">
                    <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-xl border border-[#D8E0EC] bg-white px-4 py-3 pr-11 text-sm placeholder:text-slate-400 focus:border-[#3388CC] focus:outline-none focus:ring-2 focus:ring-[#3388CC]/10 transition-all duration-200" placeholder="Masukkan password" autoFocus autoComplete="current-password" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 hover:text-slate-600" tabIndex={-1}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                </div>
                {error && <p className="rounded-xl border border-red-100/60 bg-red-50/80 px-4 py-2.5 text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={loading || !password} className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#005FAC] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-all duration-200 hover:bg-[#3388CC] hover:shadow-xl hover:shadow-black/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100">
                  {loading ? "Memproses..." : <><LogIn className="h-4 w-4" /> Masuk</>}
                </button>
                <button type="button" onClick={() => { setForgotOpen(true); setError(""); }} className="w-full text-sm font-medium text-[#3388CC] hover:text-[#005FAC]">Lupa password?</button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => { setForgotOpen(false); setForgotStep(1); setError(""); }} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft className="h-4 w-4" /> Kembali</button>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"><KeyRound className="h-3.5 w-3.5" /> Reset Password</span>
                </div>
                {forgotStep === 1 ? (
                  <form onSubmit={handleForgotLookup} className="space-y-4">
                    <div className="grid gap-4">
                      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="rounded-xl border border-[#D8E0EC] px-4 py-3 text-sm focus:border-[#3388CC] focus:outline-none focus:ring-2 focus:ring-[#3388CC]/10" required />
                      <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-xl border border-[#D8E0EC] px-4 py-3 text-sm focus:border-[#3388CC] focus:outline-none focus:ring-2 focus:ring-[#3388CC]/10">
                        <option value="superadmin">superadmin</option>
                        <option value="kepala_kantor">kepala_kantor</option>
                        <option value="kepala_bagian">kepala_bagian</option>
                        <option value="karyawan">staf</option>
                      </select>
                      <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit" className="rounded-xl border border-[#D8E0EC] px-4 py-3 text-sm focus:border-[#3388CC] focus:outline-none focus:ring-2 focus:ring-[#3388CC]/10" required />
                    </div>
                    {error && <p className="rounded-xl border border-red-100/60 bg-red-50/80 px-4 py-2.5 text-sm text-red-600">{error}</p>}
                    <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-xl bg-[#005FAC] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3388CC] disabled:opacity-50">{loading ? "Memeriksa..." : "Lanjut"}</button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password baru" className="rounded-xl border border-[#D8E0EC] px-4 py-3 text-sm focus:border-[#3388CC] focus:outline-none focus:ring-2 focus:ring-[#3388CC]/10" required />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Konfirmasi password baru" className="rounded-xl border border-[#D8E0EC] px-4 py-3 text-sm focus:border-[#3388CC] focus:outline-none focus:ring-2 focus:ring-[#3388CC]/10" required />
                    {error && <p className="rounded-xl border border-red-100/60 bg-red-50/80 px-4 py-2.5 text-sm text-red-600">{error}</p>}
                    <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-xl bg-[#005FAC] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3388CC] disabled:opacity-50">{loading ? "Menyimpan..." : "Ubah Password"}</button>
                  </form>
                )}
              </div>
            )}

            <div className="mt-8 space-y-3 border-t border-[#D8E0EC]/40 pt-6 text-center">
              <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors duration-200 hover:text-[#3388CC]">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7" /></svg>
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
