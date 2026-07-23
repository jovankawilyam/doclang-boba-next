"use client";

import {
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ServiceKey = "kuitansi" | "kutipan_rl" | "validasi_pph";

type ServiceConfig = {
  key: ServiceKey;
  label: string;
  shortLabel: string;
  title: string;
  description: string;
  placeholder: string;
  accent: string;
  ring: string;
};

const services: ServiceConfig[] = [
  {
    key: "kuitansi",
    label: "Kuitansi",
    shortLabel: "Kuitansi",
    title: "Pelacakan Dokumen Kuitansi",
    description: "Pantau status pengajuan kuitansi pasca lelang.",
    placeholder: "Contoh: 123/KPHL/2026",
    accent: "text-[#123C69]",
    ring: "border-[#C7D2E3] bg-[#F4F7FB]",
  },
  {
    key: "kutipan_rl",
    label: "Kutipan RL",
    shortLabel: "Kutipan RL",
    title: "Pelacakan Kutipan RL",
    description: "Cek progres penerbitan kutipan risalah lelang.",
    placeholder: "Contoh: 123/K-RL/2026",
    accent: "text-[#123C69]",
    ring: "border-[#C7D2E3] bg-[#F4F7FB]",
  },
  {
    key: "validasi_pph",
    label: "Validasi PPh",
    shortLabel: "Validasi PPh",
    title: "Pelacakan Validasi PPh",
    description: "Lihat status validasi PPh untuk dokumen lelang.",
    placeholder: "Contoh: 123/VPPH/2026",
    accent: "text-[#123C69]",
    ring: "border-[#C7D2E3] bg-[#F4F7FB]",
  },
];

const serviceByKey = services.reduce(
  (acc, service) => ({ ...acc, [service.key]: service }),
  {} as Record<ServiceKey, ServiceConfig>,
);

const getStatusStyles = (status: string) => {
  const s = status.toLowerCase();
  if (s === "selesai")
    return {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
      icon: <CheckCircle2 className="mr-1.5 h-4 w-4" />,
      label: "Selesai",
    };
  if (s === "siap diambil")
    return {
      badge: "border-blue-200 bg-blue-50 text-blue-800",
      icon: <Inbox className="mr-1.5 h-4 w-4" />,
      label: "Siap Diambil",
    };
  if (s === "tidak valid")
    return {
      badge: "border-red-200 bg-red-50 text-red-800",
      icon: <XCircle className="mr-1.5 h-4 w-4" />,
      label: "Tidak Valid",
    };
  return {
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    icon: <Clock className="mr-1.5 h-4 w-4" />,
    label: "Proses",
  };
};

function TrackingResult({
  document,
  searchedValue,
  service,
}: {
  document: { nomor_pengajuan: string; status_proses: string; catatan: string | null } | null;
  searchedValue: string | null;
  service: ServiceConfig;
}) {
  if (!searchedValue) return null;

  if (!document) {
    return (
      <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-[#C7D2E3] bg-white p-6 text-center shadow-xl shadow-[#C7D2E3]/50">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF3FA]">
          <Search className="h-8 w-8 text-[#123C69]" />
        </div>
        <h3 className="mb-3 text-2xl font-bold text-slate-950">
          Dokumen Tidak Ditemukan
        </h3>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600">
          Nomor{" "}
          <span className="font-mono font-bold text-slate-900">
            {searchedValue}
          </span>{" "}
          belum terdaftar pada layanan {service.label}. Periksa lagi nomor tiket
          atau pilih jenis layanan yang sesuai.
        </p>
      </div>
    );
  }

  const statusStyle = getStatusStyles(document.status_proses);

  return (
    <div className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-2xl border border-[#C7D2E3] bg-white shadow-xl shadow-[#C7D2E3]/50">
      <div className="flex flex-col gap-4 border-b border-[#D8E0EC] p-6 sm:flex-row sm:items-center">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border ${service.ring}`}
        >
          <FileText className={`h-7 w-7 ${service.accent}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-widest text-slate-500 uppercase">
            Hasil Pencarian {service.label}
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
                  className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold ${statusStyle.badge}`}
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

export default function TrackingSection() {
  const [query, setQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [result, setResult] = useState<{
    document: { nomor_pengajuan: string; status_proses: string; catatan: string | null } | null;
    searchedValue: string;
  } | null>(null);
  const [activeService, setActiveService] = useState<ServiceKey>("kuitansi");
  const [stats, setStats] = useState<Record<string, number>>({ total: 0, proses: 0, siap_diambil: 0, tidak_valid: 0, selesai: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const trackingResultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStatsLoading(true);
    fetch(`/api/lacak/stats?layanan=${activeService}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d);
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [activeService]);

  const activeConfig = serviceByKey[activeService];

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
      });
    } catch {
      setResult({
        document: null,
        searchedValue: query,
      });
    } finally {
      setSearchLoading(false);
    }
    setTimeout(() => {
      trackingResultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <main
      id="tracking"
      className="mx-auto mt-10 w-full max-w-7xl scroll-mt-24 px-4 md:px-8"
    >
      <section className="rounded-3xl border border-[#C7D2E3] bg-white p-4 shadow-2xl shadow-[#C7D2E3]/50 md:p-6">
        <div className="mb-4 rounded-2xl border border-[#D8E0EC] bg-[#F8FAFC] p-4">
          <p className="mb-3 text-base font-bold text-slate-950">
            1. Pilih jenis layanan
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {services.map((service) => {
              const selected = service.key === activeService;
              return (
                <button
                  key={service.key}
                  type="button"
                  onClick={() => {
                    setActiveService(service.key);
                    setResult(null);
                  }}
                  aria-pressed={selected}
                  className={`rounded-xl border px-4 py-4 text-base font-bold transition sm:text-sm md:text-base ${
                    selected
                      ? "border-blue-700 bg-blue-700 text-white shadow-sm"
                      : "border-[#C7D2E3] bg-white text-slate-700 hover:border-blue-700 hover:bg-blue-50"
                  }`}
                >
                  {service.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr] lg:items-stretch">
          <div className="rounded-2xl border border-[#C7D2E3] bg-[#F8FAFC] p-5 md:p-6 lg:order-1">
            <div className="mb-5">
              <p className="text-base font-bold text-blue-700">
                2. Masukkan nomor tiket
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                {activeConfig.title}
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-slate-700">
                {activeConfig.description}
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col gap-3">
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
                  placeholder={activeConfig.placeholder}
                  className="h-16 w-full border border-[#C7D2E3] bg-transparent pr-4 pl-14 text-lg font-semibold rounded-xl shadow-none focus-visible:ring-2 focus-visible:ring-blue-200 focus:outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading || !query}
                className="flex h-16 items-center justify-center gap-2 rounded-xl bg-blue-700 px-7 text-lg font-bold text-white transition hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-700/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {searchLoading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Mencari...</>
                ) : (
                  "Lacak Sekarang"
                )}
              </button>
              <p className="text-sm leading-relaxed text-slate-600">
                Pastikan jenis layanan di atas sudah sesuai dengan tiket Anda.
              </p>
            </form>
          </div>

          {result && (
            <div
              ref={trackingResultRef}
              className="scroll-mt-24 lg:order-3 lg:col-span-2"
            >
              <TrackingResult
                document={result.document}
                searchedValue={result.searchedValue}
                service={activeConfig}
              />
            </div>
          )}

          <div className={`rounded-2xl border p-5 md:p-6 lg:order-2 ${activeConfig.ring}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-bold text-slate-950">
                  3. Lihat ringkasan status
                </p>
                <h2 className={`mt-1 text-3xl font-bold ${activeConfig.accent}`}>
                  {activeConfig.label}
                </h2>
              </div>
              <div className="rounded-2xl border border-[#D8E0EC] bg-white px-5 py-3 text-right shadow-sm">
                <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                  Total
                </p>
                <p className={`text-5xl font-bold text-slate-950 ${statsLoading ? "animate-pulse" : ""}`}>
                  {new Intl.NumberFormat("id-ID").format(stats.total || 0)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              {[
                { label: "Proses", key: "proses", icon: Clock, className: "border-amber-200 bg-amber-50 text-amber-800" },
                { label: "Siap Diambil", key: "siap_diambil", icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
                { label: "Tidak Valid", key: "tidak_valid", icon: XCircle, className: "border-red-200 bg-red-50 text-red-800" },
                { label: "Selesai", key: "selesai", icon: Inbox, className: "border-blue-200 bg-blue-50 text-blue-800" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`rounded-xl border bg-white/90 p-4 shadow-sm backdrop-blur ${item.className}`}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-bold uppercase">{item.label}</span>
                      <Icon className="h-5 w-5 shrink-0" />
                    </div>
                    <p className={`text-4xl font-bold ${statsLoading ? "animate-pulse" : ""}`}>
                      {new Intl.NumberFormat("id-ID").format(stats[item.key] || 0)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
