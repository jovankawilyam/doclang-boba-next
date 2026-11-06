"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Eye, EyeOff, X, CheckCircle2 } from "lucide-react";

export function PasswordResultModal({
  data,
  onClose,
}: {
  data: {
    username: string;
    name: string;
    email?: string;
    delivery: "manual" | "email";
    emailSent: boolean;
    temporaryPassword?: string;
  };
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") event.preventDefault();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleCopy() {
    if (!data.temporaryPassword) return;
    try {
      await navigator.clipboard.writeText(data.temporaryPassword);
      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
    }
  }

  function maskEmail(email: string): string {
    const [user, domain] = email.split("@");
    if (!domain) return email;
    const masked = user.length > 2 ? user[0] + "***" + user[user.length - 1] : user[0] + "***";
    return `${masked}@${domain}`;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--admin-overlay)" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-result-title"
        className="relative w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}
      >
        <button
           onClick={onClose}
           aria-label="Tutup hasil reset password"
           className="absolute right-4 top-4 rounded-lg p-1 transition-colors"
           style={{ color: "var(--admin-text-secondary)" }}
         >
          <X className="h-5 w-5" />
        </button>

        {data.emailSent ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
             <h3 id="password-result-title" className="text-base font-bold" style={{ color: "var(--admin-text-primary)" }}>
              Password Berhasil Direset
            </h3>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--admin-text-secondary)" }}>
              Password sementara telah dikirimkan ke email:
            </p>
            <p className="mt-1 font-mono text-sm font-semibold" style={{ color: "var(--admin-text-body)" }}>
              {data.email ? maskEmail(data.email) : "-"}
            </p>
            <p className="mt-4 text-xs text-amber-700 bg-amber-50 rounded-xl p-3 border border-amber-200">
              User wajib login menggunakan password sementara tersebut dan menggantinya pada saat login pertama.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: "var(--admin-text-primary)" }}
            >
              Selesai
            </button>
          </div>
        ) : (
          <div>
             <h3 id="password-result-title" className="text-base font-bold" style={{ color: "var(--admin-text-primary)" }}>
              Password Sementara
            </h3>
             <p className="mt-1 text-xs" style={{ color: "var(--admin-text-secondary)" }}>
               {data.delivery === "manual"
                 ? "Berikan password sementara ini langsung kepada user."
                 : data.email
                   ? "Pengiriman email gagal. Berikan password ini langsung kepada user."
                   : "Akun ini belum memiliki email. Berikan password ini langsung kepada user."}
             </p>

            <div className="mt-4 rounded-xl border p-3" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg)" }}>
              <div className="text-[11px] font-semibold" style={{ color: "var(--admin-text-secondary)" }}>
                Akun: <span className="font-bold" style={{ color: "var(--admin-text-body)" }}>{data.name} ({data.username})</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2" style={{ borderColor: "var(--admin-border-input)" }}>
                <span className="font-mono text-base font-bold tracking-wider" style={{ color: "var(--admin-text-body)" }}>
                  {showPassword ? data.temporaryPassword : "••••••••••••"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="rounded p-1 text-slate-400 hover:text-slate-600"
                    title={showPassword ? "Sembunyikan" : "Tampilkan"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: "var(--admin-text-primary)" }}
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Tersalin" : "Salin"}
                  </button>
                </div>
                {copyError && <p className="mt-2 text-[11px] text-red-600">Clipboard tidak tersedia. Salin password secara manual.</p>}
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800">
              <strong>Penting:</strong> Password ini hanya ditampilkan sekali. Catat atau salin sekarang. Password berlaku 24 jam dan user wajib menggantinya saat login pertama.
            </div>

            <button
              onClick={onClose}
              className="mt-5 w-full rounded-xl py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: "var(--admin-text-primary)" }}
            >
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
