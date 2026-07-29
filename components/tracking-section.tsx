"use client";

import {
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  Info,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";


type ServiceLabel = "Kuitansi" | "Kutipan RL" | "Validasi PPh";

const SERVICES: { key: ServiceLabel; color: string; border: string; iconBg: string }[] = [
  { key: "Kuitansi", color: "text-[#005FAC]", border: "border-[#C7D2E3] bg-[#F4F7FB]", iconBg: "bg-[#EEF3FA]" },
  { key: "Kutipan RL", color: "text-[#3388CC]", border: "border-[#C7D2E3] bg-[#F4F7FB]", iconBg: "bg-[#EEF3FA]" },
  { key: "Validasi PPh", color: "text-[#0F2D4E]", border: "border-[#C7D2E3] bg-[#F4F7FB]", iconBg: "bg-[#EEF3FA]" },
];

type ServiceStats = { total: number; proses: number; siap_diambil: number; tidak_valid: number; selesai: number };

const STATUS_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  selesai: { border: "#A8E6C0", bg: "#E8F8F0", text: "#02A54F" },
  "siap diambil": { border: "#B3D4F0", bg: "#E6F0FA", text: "#005FAC" },
  "tidak valid": { border: "#FECACA", bg: "#FEE2E2", text: "#DC2626" },
};

const getStatusStyles = (status: string) => {
  const s = status.toLowerCase();
  const c = STATUS_COLORS[s];
  if (c)
    return {
      badge: c,
      icon: s === "selesai" ? <CheckCircle2 className="mr-1.5 h-4 w-4" /> : s === "siap diambil" ? <Inbox className="mr-1.5 h-4 w-4" /> : <XCircle className="mr-1.5 h-4 w-4" />,
      label: s === "selesai" ? "Selesai" : s === "siap diambil" ? "Siap Diambil" : "Tidak Valid",
    };
  return {
    badge: { border: "#FDE68A", bg: "#FEF3C7", text: "#FAB715" },
    icon: <Clock className="mr-1.5 h-4 w-4" />,
    label: "Proses",
  };
};

function TrackingResult({
  document,
  searchedValue,
  jenisLayanan,
}: {
  document: { nomor_pengajuan: string; status_proses: string; catatan: string | null } | null;
  searchedValue: string | null;
  jenisLayanan: string;
}) {
  if (!searchedValue) return null;

  if (!document) {
    return (
      <div className="rounded-2xl border border-[#C7D2E3] bg-white p-6 text-center shadow-xl shadow-[#C7D2E3]/50">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF3FA]">
          <Search className="h-8 w-8 text-[#005FAC]" />
        </div>
        <h3 className="mb-3 text-2xl font-bold text-slate-950">
          Dokumen Tidak Ditemukan
        </h3>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600">
          Nomor{" "}
          <span className="font-mono font-bold text-slate-900">
            {searchedValue}
          </span>{" "}
          belum terdaftar. Periksa kembali nomor tiket Anda.
        </p>
      </div>
    );
  }

  const statusStyle = getStatusStyles(document.status_proses);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#C7D2E3] bg-white shadow-xl shadow-[#C7D2E3]/50">
      <div className="flex flex-col gap-4 border-b border-[#D8E0EC] p-6 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#C7D2E3] bg-[#F4F7FB]">
          <FileText className="h-7 w-7 text-[#005FAC]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-widest text-slate-500 uppercase">
            Hasil Pencarian
          </p>
          <p className="mt-0.5 text-xs font-semibold text-[#3388CC]">
            {jenisLayanan}
          </p>
          <h2 className="mt-1 font-mono text-2xl font-bold break-words text-slate-950 sm:text-3xl">
            {document.nomor_pengajuan}
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-base">
          <thead className="border-b border-[#D8E0EC] bg-[#F4F7FB]">
            <tr>
              <th className="px-6 py-5 font-bold text-slate-700">
                Jenis Dokumen
              </th>
              <th className="px-6 py-5 font-bold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8E0EC]">
            <tr className="transition-colors hover:bg-[#F4F7FB]">
              <td className="px-6 py-5 font-semibold text-slate-900">
                Status Proses Dokumen
              </td>
              <td className="px-6 py-5">
                <span
                  className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold"
                  style={{ borderColor: statusStyle.badge.border, backgroundColor: statusStyle.badge.bg, color: statusStyle.badge.text }}
                >
                  {statusStyle.icon}
                  {statusStyle.label}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {document.catatan && (
        <div className="border-t border-[#D8E0EC] bg-[#F4F7FB] p-5">
          <p className="mb-1 text-xs font-bold tracking-widest text-slate-500 uppercase">
            Catatan Petugas
          </p>
          <p className="text-base leading-relaxed text-slate-700 italic">
            &ldquo;{document.catatan}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}

const STAT_ITEMS: { label: string; key: keyof ServiceStats; icon: React.ElementType; border: string; bg: string; text: string }[] = [
  { label: "Proses", key: "proses", icon: Clock, border: "#FDE68A", bg: "#FEF3C7", text: "#FAB715" },
  { label: "Siap Diambil", key: "siap_diambil", icon: CheckCircle2, border: "#B3D4F0", bg: "#E6F0FA", text: "#005FAC" },
  { label: "Tidak Valid", key: "tidak_valid", icon: XCircle, border: "#FECACA", bg: "#FEE2E2", text: "#DC2626" },
  { label: "Selesai", key: "selesai", icon: Inbox, border: "#A8E6C0", bg: "#E8F8F0", text: "#02A54F" },
];

function ServiceStatsCard({ label, stats }: { label: string; stats: ServiceStats }) {
  return (
    <div className="rounded-xl border border-[#C7D2E3] bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-base font-bold text-slate-950">{label}</h3>
      <div className="space-y-2">
        {STAT_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm" style={{ borderColor: item.border, backgroundColor: item.bg, color: item.text }}>
              <span className="font-semibold">{item.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold">{stats[item.key]}</span>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackingSection() {
  const [query, setQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [result, setResult] = useState<{
    document: { nomor_pengajuan: string; status_proses: string; catatan: string | null } | null;
    searchedValue: string;
    jenisLayanan: string;
  } | null>(null);
  const [perLayananStats, setPerLayananStats] = useState<Record<string, ServiceStats> | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  useEffect(() => {
    fetch("/api/lacak/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.perLayanan) setPerLayananStats(d.perLayanan);
      })
      .catch(() => setPerLayananStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/lacak?id=${query}`);
      const json = await res.json();
      const d = json.data;
      setResult({
        document: d
          ? {
              nomor_pengajuan: d.id_pengajuan || query,
              status_proses: d.status_proses || "",
              catatan: d.catatan_tidak_valid || null,
            }
          : null,
        searchedValue: query,
        jenisLayanan: d?.jenis_layanan || "",
      });
    } catch {
      setResult({
        document: null,
        searchedValue: query,
        jenisLayanan: "",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <main
      id="tracking"
      className="mx-auto mt-10 w-full max-w-5xl scroll-mt-24 px-4 md:px-8"
    >
      <section className="rounded-3xl border border-[#C7D2E3] bg-white p-4 shadow-2xl shadow-[#C7D2E3]/50 md:p-6">
        {/* SEARCH */}
        <div className="rounded-2xl border border-[#C7D2E3] bg-[#F8FAFC] p-5 md:p-6">
  <h2 className="text-3xl font-bold text-slate-950 md:text-4xl">
    Lacak Dokumen
  </h2>

  <p className="mt-2 text-lg leading-relaxed text-slate-700">
    Pantau status pengajuan dokumen pasca lelang.
  </p>

  {/* Informasi */}
  <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
    <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />

    <div className="w-full">
      <p className="font-semibold text-blue-900">
        Informasi
      </p>

      <p className="mt-1 text-sm leading-relaxed text-blue-800">
        Pastikan nomor pengajuan atau nomor tiket yang Anda masukkan
        sesuai dengan bukti permohonan yang diterima. Kesalahan
        penulisan nomor dapat menyebabkan status dokumen tidak
        ditemukan.
      </p>

<div className="mt-4 rounded-lg border border-blue-100 bg-white p-3">
  <p className="text-sm font-semibold text-slate-900">
    Contoh format nomor:
  </p>

  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
    <div className="rounded-lg border border-slate-200 p-3 text-center">
      <p className="text-sm font-semibold text-slate-700">
        Kuitansi
      </p>
      <code className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-900">
        1/KPHL/2026
      </code>
    </div>

    <div className="rounded-lg border border-slate-200 p-3 text-center">
      <p className="text-sm font-semibold text-slate-700">
        Kutipan RL
      </p>
      <code className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-900">
        1/K-RL/2026
      </code>
    </div>

    <div className="rounded-lg border border-slate-200 p-3 text-center">
      <p className="text-sm font-semibold text-slate-700">
        Validasi PPh
      </p>
      <code className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-900">
        1/VPPH/2026
      </code>
    </div>
  </div>
</div>
    </div>
  </div>

  <form onSubmit={handleSearch} className="mt-5 flex flex-col gap-3">
    <label
      htmlFor="tracking-number"
      className="text-base font-bold text-slate-800"
    >
      Nomor tiket / nomor pengajuan
    </label>

    <div className="relative flex-1 rounded-xl bg-white shadow-sm">
      <Search className="absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2 text-slate-400" />

      <input
  id="tracking-number"
  type="text"
  placeholder="Masukkan nomor tiket"
  className="h-16 w-full rounded-xl border border-[#C7D2E3] bg-transparent pl-14 pr-4 text-lg font-semibold shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005FAC]/20"
  value={query}
  onChange={(e) => setQuery(e.target.value.toUpperCase())}
  required
/>
    </div>

    <button
      type="submit"
      disabled={searchLoading || !query}
      className="flex h-16 items-center justify-center gap-2 rounded-xl bg-[#005FAC] px-7 text-lg font-bold text-white transition hover:bg-[#004A8A] hover:shadow-lg hover:shadow-[#005FAC]/20 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {searchLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Mencari...
        </>
      ) : (
        "Lacak Sekarang"
      )}
    </button>
  </form>
</div>

        {/* RESULT */}
        {result && (
          <div ref={resultRef} className="mt-5 scroll-mt-24">
            <TrackingResult
              document={result.document}
              searchedValue={result.searchedValue}
              jenisLayanan={result.jenisLayanan}
            />
          </div>
        )}

        {/* RINGKASAN STATUS */}
        <div className="mt-6 rounded-2xl border border-[#C7D2E3] bg-[#F8FAFC] p-5 md:p-6">
          <h3 className="mb-5 text-xl font-bold text-slate-950">
            Ringkasan Status
          </h3>
          {statsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#C7D2E3] border-t-[#005FAC]" />
              <span className="ml-3 text-sm text-slate-500">Memuat statistik...</span>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {SERVICES.map((svc) => (
                <ServiceStatsCard
                  key={svc.key}
                  label={svc.key}
                  stats={perLayananStats?.[svc.key] ?? { total: 0, proses: 0, siap_diambil: 0, tidak_valid: 0, selesai: 0 }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
