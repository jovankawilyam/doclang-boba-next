"use client";

import { useEffect, useState } from "react";
import { ToastContainer, useToast } from "@/components/toast";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { Shield, Save, Globe } from "lucide-react";
import { getAuthHeaders } from "@/lib/admin-fetch";
import { AutoTextarea } from "@/components/admin/auto-textarea";

type FooterSettings = {
  officeName: string;
  address: string;
  operatingHours: string;
  socialLinks: {
    youtube: string;
    instagram: string;
    tiktok: string;
  };
  mapsUrl: string;
  copyright: string;
};

const DEFAULT_FOOTER: FooterSettings = {
  officeName: "Kantor Pelayanan Kekayaan Negara dan Lelang Bogor",
  address: "Jalan Veteran No. 45, Panaragan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16125",
  operatingHours: "Senin - Kamis: 08.00 - 16.00 WIB\nJumat: WFH",
  socialLinks: {
    youtube: "https://www.youtube.com/@kpknlbogor",
    instagram: "https://www.instagram.com/kpknl.bogor",
    tiktok: "https://www.tiktok.com/@kpknl.bogor",
  },
  mapsUrl: "https://maps.google.com/?q=KPKNL+Bogor+Jalan+Veteran+No+45+Bogor+Jawa+Barat",
  copyright: "© 2026 KPKNL Bogor. Seluruh hak cipta dilindungi sesuai ketentuan yang berlaku.",
};

export default function PengaturanPage() {
  const { toasts, toast, dismiss } = useToast();
  const [footer, setFooter] = useState<FooterSettings>(DEFAULT_FOOTER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/footer", { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setFooter({ ...DEFAULT_FOOTER, ...json.data, socialLinks: { ...DEFAULT_FOOTER.socialLinks, ...(json.data.socialLinks ?? {}) } });
        } else {
          toast("error", json.error || "Gagal memuat pengaturan footer");
        }
      })
      .catch(() => toast("error", "Gagal memuat pengaturan footer"))
      .finally(() => setLoading(false));
  }, [toast]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(footer),
      });
      const json = await res.json();
      if (json.success) {
        toast("success", "Pengaturan footer berhasil disimpan");
        if (json.data) {
          setFooter({ ...DEFAULT_FOOTER, ...json.data, socialLinks: { ...DEFAULT_FOOTER.socialLinks, ...(json.data.socialLinks ?? {}) } });
        }
      } else {
        toast("error", json.error || "Gagal menyimpan pengaturan footer");
      }
    } catch {
      toast("error", "Gagal menyimpan pengaturan footer");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--admin-text-primary)" }}>Pengaturan</h1>
          <p className="mt-1 text-xs" style={{ color: "var(--admin-text-secondary)" }}>Konfigurasi sistem dan isi footer website</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border shadow-sm" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}>
          <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: "var(--admin-border)" }}>
            <Shield className="h-5 w-5" style={{ color: "var(--admin-text-primary)" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--admin-text-primary)" }}>Keamanan</h2>
          </div>
          <div className="p-6">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold text-amber-800">
                Login admin sekarang dikelola melalui akun database dan role.
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Gunakan menu Admin Akun untuk menambah atau mengelola akun.
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
                <span className="font-semibold" style={{ color: "var(--admin-text-body)" }}>Cookie + Fallback Lokal</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border shadow-sm" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}>
          <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: "var(--admin-border)" }}>
            <Globe className="h-5 w-5" style={{ color: "var(--admin-text-primary)" }} />
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
              <span className="font-semibold" style={{ color: "var(--admin-text-body)" }}>PostgreSQL</span>
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

        <div className="rounded-xl border shadow-sm xl:col-span-2" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}>
          <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: "var(--admin-border)" }}>
            <Globe className="h-5 w-5" style={{ color: "var(--admin-text-primary)" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--admin-text-primary)" }}>Footer Website</h2>
          </div>

          <div className="space-y-6 p-6">
            {loading ? (
              <div className="py-10 text-sm" style={{ color: "var(--admin-text-secondary)" }}>Memuat pengaturan footer...</div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--admin-text-secondary)" }}>Nama Instansi</label>
                    <AutoTextarea value={footer.officeName} onChange={(value) => setFooter((prev) => ({ ...prev, officeName: value }))} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--admin-text-secondary)" }}>Jam Operasional</label>
                    <AutoTextarea value={footer.operatingHours} onChange={(value) => setFooter((prev) => ({ ...prev, operatingHours: value }))} rows={3} />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--admin-text-secondary)" }}>Alamat</label>
                  <AutoTextarea value={footer.address} onChange={(value) => setFooter((prev) => ({ ...prev, address: value }))} rows={3} />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--admin-text-secondary)" }}>YouTube</label>
                    <AutoTextarea value={footer.socialLinks.youtube} onChange={(value) => setFooter((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, youtube: value } }))} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--admin-text-secondary)" }}>Instagram</label>
                    <AutoTextarea value={footer.socialLinks.instagram} onChange={(value) => setFooter((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, instagram: value } }))} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--admin-text-secondary)" }}>TikTok</label>
                    <AutoTextarea value={footer.socialLinks.tiktok} onChange={(value) => setFooter((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, tiktok: value } }))} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--admin-text-secondary)" }}>Link Google Maps</label>
                    <AutoTextarea value={footer.mapsUrl} onChange={(value) => setFooter((prev) => ({ ...prev, mapsUrl: value }))} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--admin-text-secondary)" }}>Teks Copyright</label>
                    <AutoTextarea value={footer.copyright} onChange={(value) => setFooter((prev) => ({ ...prev, copyright: value }))} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t pt-4" style={{ borderColor: "var(--admin-border)" }}>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    style={{ backgroundColor: "var(--admin-text-primary)" }}
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Menyimpan..." : "Simpan Footer"}
                  </button>
                  <p className="text-xs" style={{ color: "var(--admin-text-secondary)" }}>
                    Perubahan akan langsung dipakai pada footer website publik.
                  </p>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-xs text-blue-800">
                  <strong>Catatan:</strong> Logo tetap statis. Yang bisa diedit dari sini adalah isi teks, jam operasional, link sosial, dan lokasi. Gunakan tombol <strong>Enter</strong> di kolom teks untuk membuat baris baru.
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </>
  );
}
