"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Search, CheckCircle, XCircle, Clock, Inbox, LogOut, ExternalLink, X } from "lucide-react";
import { ToastContainer, useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";

type MonitoringRow = Record<string, string>;
type DetailData = Record<string, string>;

const STATUS_OPTIONS = ["", "proses", "siap diambil", "tidak valid", "selesai"];
const LAYANAN_OPTIONS = ["", "Kuitansi", "Kutipan RL", "Validasi PPh"];

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  proses: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", label: "Proses" },
  "siap diambil": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", label: "Siap Diambil" },
  "tidak valid": { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400", label: "Tidak Valid" },
  selesai: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400", label: "Selesai" },
};

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? "";
  const style = STATUS_STYLES[s] ?? { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400", label: status || "-" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

function cleanWaNumber(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("0")) return "62" + d.slice(1);
  if (d.startsWith("62")) return d;
  if (d.startsWith("8")) return "62" + d;
  return d;
}

function waLink(number: string, text: string): string {
  return `https://wa.me/${cleanWaNumber(number)}?text=${encodeURIComponent(text)}`;
}

function formatDate(iso: string): string {
  if (!iso || iso === "-") return "-";
  try {
    if (/^\d{2}\/\d{2}\/\d{4}/.test(iso)) return iso;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const ok = sessionStorage.getItem("admin_auth") === "true";
    if (!ok) router.replace("/admin/login");
    else setAuthed(true);
  }, [router]);

  const [rows, setRows] = useState<MonitoringRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [globalStats, setGlobalStats] = useState({ total: 0, proses: 0, siap_diambil: 0, tidak_valid: 0, selesai: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [layananFilter, setLayananFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onSearchChange = (val: string) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(val), 400);
  };

  const { toasts, toast, dismiss } = useToast();

  const [detail, setDetail] = useState<{ id: string; data: DetailData | null; loading: boolean }>({ id: "", data: null, loading: false });
  const [action, setAction] = useState<{ type: string; reason: string; date: string; loading: boolean }>({ type: "", reason: "", date: "", loading: false });
  const [confirm, setConfirm] = useState<{ status: string } | null>(null);
  const [waResult, setWaResult] = useState<{ number: string; text: string } | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (layananFilter) params.set("layanan", layananFilter);
    if (search) params.set("search", search);
    params.set("page", String(page));
    try {
      const res = await fetch(`/api/admin/permohonan?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRows(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
        if (json.stats) setGlobalStats(json.stats);
      } else toast("error", json.error || "Gagal memuat data");
    } catch {
      toast("error", "Gagal memuat data. Periksa koneksi.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, layananFilter, search, page]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  useEffect(() => { setPage(1); }, [statusFilter, layananFilter, search]);

  async function openDetail(id: string) {
    setDetail({ id, data: null, loading: true });
    setWaResult(null);
    setAction({ type: "", reason: "", date: "", loading: false });
    try {
      const res = await fetch(`/api/admin/permohonan?id=${encodeURIComponent(id)}`);
      const json = await res.json();
      if (json.success) setDetail((p) => ({ ...p, data: json.data }));
      else toast("error", json.error || "Gagal memuat detail");
    } catch {
      toast("error", "Gagal memuat detail");
    } finally {
      setDetail((p) => ({ ...p, loading: false }));
    }
  }

  async function handleAction(status: string) {
    if (!detail.id) return;
    setAction((p) => ({ ...p, loading: true }));
    setWaResult(null);
    setConfirm(null);
    try {
      const body: Record<string, string> = { id: detail.id, status };
      if (status === "Tidak Valid") body.reason = action.reason;
      if (status === "Selesai") body.tglPengambilan = action.date;
      const res = await fetch("/api/admin/permohonan", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.success) {
        const waNumber = detail.data?.["Nomor Whatsapp Pemohon"] ?? "";
        const nama = detail.data?.["Nama Pemohon"] ?? "";
        let waText = "";
        if (status === "Siap Diambil") waText = `Yth. ${nama},\n\nPermohonan Anda (${detail.id}) telah DIVALIDASI. Silakan ambil dokumen di KPKNL Bogor.\n\nTerima kasih.`;
        else if (status === "Tidak Valid") waText = `Yth. ${nama},\n\nPermohonan Anda (${detail.id}) DITOLAK.\nAlasan: ${action.reason || "-"}\n\nSilakan lengkapi persyaratan dan ajukan ulang.\n\nTerima kasih.`;
        else if (status === "Selesai") waText = `Yth. ${nama},\n\nPermohonan Anda (${detail.id}) telah SELESAI. Dokumen dapat diambil pada ${action.date || "-"} di KPKNL Bogor.\n\nTerima kasih.`;
        setWaResult({ number: waNumber, text: waText });
        toast("success", `Status berhasil diubah menjadi ${status}`);
        fetchRows();
        openDetail(detail.id);
      } else {
        toast("error", json.error || "Gagal mengubah status");
      }
    } catch {
      toast("error", "Gagal mengubah status");
    } finally {
      setAction((p) => ({ ...p, loading: false }));
    }
  }

  const stats = globalStats;

  if (!authed) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB]"><p className="text-sm text-slate-500">Mengalihkan ke login...</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-[#D8E0EC] bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 md:px-8">
          <div className="flex items-center gap-3">
            <img src="/images/image.png" alt="Logo" className="h-9 w-auto object-contain" />
            <span className="hidden text-sm font-bold text-[#123C69] sm:inline">Doclang Boba</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-md bg-[#123C69] px-3 py-1.5">
              <FileText className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-bold text-white">Admin</span>
            </div>
            <Link href="/" className="rounded-md border border-[#C7D2E3] px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Beranda</Link>
            <button onClick={() => { sessionStorage.removeItem("admin_auth"); router.push("/admin/login"); }} className="flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"><LogOut className="h-3 w-3" /> Keluar</button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#123C69]">Dashboard</h1>
          <p className="text-xs text-slate-500">Kelola dan pantau seluruh permohonan dokumen pasca lelang</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Total", value: stats.total, color: "text-[#123C69]", bg: "bg-[#EEF3FA]", border: "border-[#C7D2E3]", icon: FileText },
            { label: "Proses", value: stats.proses, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
            { label: "Siap Diambil", value: stats.siap_diambil, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle },
            { label: "Tidak Valid", value: stats.tidak_valid, color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
            { label: "Selesai", value: stats.selesai, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: Inbox },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`rounded-lg border ${s.border} ${s.bg} p-3 shadow-sm`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{s.label}</span>
                  <Icon className={`h-4 w-4 ${s.color} opacity-60`} />
                </div>
                <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            );
          })}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-[#C7D2E3] bg-white px-3 py-2 text-xs font-medium text-slate-600 focus:border-[#1E56A0] focus:outline-none">
            <option value="">Semua Status</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</option>)}
          </select>
          <select value={layananFilter} onChange={(e) => setLayananFilter(e.target.value)} className="rounded-lg border border-[#C7D2E3] bg-white px-3 py-2 text-xs font-medium text-slate-600 focus:border-[#1E56A0] focus:outline-none">
            <option value="">Semua Layanan</option>
            {LAYANAN_OPTIONS.filter(Boolean).map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <div className="relative flex-1 min-w-[180px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari ID Pengajuan..." value={searchInput} onChange={(e) => onSearchChange(e.target.value)} className="w-full rounded-lg border border-[#C7D2E3] bg-white py-2 pl-9 pr-3 text-xs focus:border-[#1E56A0] focus:outline-none" />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#D8E0EC] bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center p-12"><div className="h-5 w-5 animate-spin rounded-full border-2 border-[#C7D2E3] border-t-[#123C69]" /><span className="ml-3 text-sm text-slate-500">Memuat data...</span></div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400"><Inbox className="mb-2 h-8 w-8" /><p className="text-sm">Belum ada permohonan</p></div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D8E0EC] bg-[#F4F7FB]">
                  <th className="px-4 py-3 font-bold text-slate-500">Tgl Permintaan</th>
                  <th className="px-4 py-3 font-bold text-slate-500">ID Pengajuan</th>
                  <th className="px-4 py-3 font-bold text-slate-500">Jenis Layanan</th>
                  <th className="px-4 py-3 font-bold text-slate-500">Kode Lot</th>
                  <th className="px-4 py-3 font-bold text-slate-500">Status</th>
                  <th className="px-4 py-3 font-bold text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-[#D8E0EC] transition-colors hover:bg-[#F4F7FB] last:border-0">
                    <td className="px-4 py-3 text-slate-500">{formatDate(r["Tgl Permintaan"])}</td>
                    <td className="px-4 py-3 font-medium text-[#1E56A0]">{r["ID Pengajuan"] || "-"}</td>
                    <td className="px-4 py-3">{r["Jenis Layanan"] || "-"}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{r["Kode Lot Lelang"] || "-"}</td>
                    <td className="px-4 py-3"><StatusBadge status={r["Status Proses"]} /></td>
                    <td className="px-4 py-3">
                      <button onClick={(e) => { e.stopPropagation(); openDetail(r["ID Pengajuan"]); }} className="flex items-center gap-1 rounded-md border border-[#1E56A0] px-2.5 py-1 text-xs font-semibold text-[#1E56A0] transition-colors hover:bg-[#1E56A0] hover:text-white"><ExternalLink className="h-3 w-3" /> Detail</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#D8E0EC] bg-white px-4 py-3">
              <p className="text-xs text-slate-500">
                {total} data &middot; Halaman {page} dari {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-md border border-[#C7D2E3] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-[#F4F7FB] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  &larr; Sebelumnya
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const num = start + i;
                  return (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                        num === page
                          ? "bg-[#1E56A0] text-white"
                          : "border border-[#C7D2E3] text-slate-600 hover:bg-[#F4F7FB]"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-md border border-[#C7D2E3] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-[#F4F7FB] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Selanjutnya &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {detail.id && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 p-4 pt-12" onClick={() => { setDetail({ id: "", data: null, loading: false }); setWaResult(null); setAction({ type: "", reason: "", date: "", loading: false }); }}>
          <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#D8E0EC] px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-[#123C69]">Detail Permohonan</h2>
                <p className="text-xs text-slate-400">ID: {detail.id}</p>
              </div>
              <button onClick={() => { setDetail({ id: "", data: null, loading: false }); setWaResult(null); setAction({ type: "", reason: "", date: "", loading: false }); }} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>

            {detail.loading ? (
              <div className="flex items-center justify-center p-12"><div className="h-5 w-5 animate-spin rounded-full border-2 border-[#C7D2E3] border-t-[#123C69]" /><span className="ml-3 text-sm text-slate-500">Memuat detail...</span></div>
            ) : detail.data ? (
              <div className="px-6 py-4">
                <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-2">
                  {Object.entries(detail.data).filter(([k, v]) => v && !k.startsWith("Merged") && !k.startsWith("Link") && !k.startsWith("Document") && !k.startsWith("bantu_") && k !== "jarak" && k !== "_" && !k.startsWith("Verif") && !k.startsWith("auto_")).map(([key, val]) => {
                    const isUrl = typeof val === "string" && (val.startsWith("http://") || val.startsWith("https://"));
                    return (
                      <div key={key} className={key.includes("Keterangan") || key.includes("Alamat") ? "col-span-2" : ""}>
                        <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{key}</div>
                        <div className="mt-0.5 text-sm">
                          {isUrl ? (
                            <a href={val} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-[#1E56A0] hover:text-[#123C69] hover:underline"><ExternalLink className="h-3 w-3 shrink-0" />{val.length > 50 ? val.slice(0, 50) + "..." : val}</a>
                          ) : val ? (
                            <span className="text-slate-800">{val}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[#D8E0EC] pt-4">
                  <p className="mb-3 text-xs font-bold text-[#123C69] uppercase tracking-wider">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                    { label: "Siap Diambil", value: "Siap Diambil", colors: { active: "bg-emerald-600 text-white", inactive: "border border-emerald-300 text-emerald-700 hover:bg-emerald-50" } },
                    { label: "Tidak Valid", value: "Tidak Valid", colors: { active: "bg-red-600 text-white", inactive: "border border-red-300 text-red-700 hover:bg-red-50" } },
                    { label: "Selesai", value: "Selesai", colors: { active: "bg-blue-600 text-white", inactive: "border border-blue-300 text-blue-700 hover:bg-blue-50" } },
                  ].map((s) => (
                      <button key={s.label} onClick={() => setAction((p) => ({ ...p, type: p.type === s.value ? "" : s.value, reason: "", date: "" }))} disabled={action.loading} className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
                        action.type === s.value ? s.colors.active : s.colors.inactive
                      }`}>{s.label}</button>
                    ))}
                  </div>

                  {action.type === "Tidak Valid" && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input type="text" placeholder="Alasan penolakan..." value={action.reason} onChange={(e) => setAction((p) => ({ ...p, reason: e.target.value }))} className="min-w-[240px] flex-1 rounded-lg border border-[#C7D2E3] px-3 py-2 text-xs" autoFocus />
                      <button onClick={() => setConfirm({ status: "Tidak Valid" })} disabled={action.loading || !action.reason.trim()} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50">{action.loading ? "..." : "Konfirmasi Tolak"}</button>
                    </div>
                  )}

                  {action.type === "Selesai" && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input type="date" value={action.date} onChange={(e) => setAction((p) => ({ ...p, date: e.target.value }))} className="rounded-lg border border-[#C7D2E3] px-3 py-2 text-xs" autoFocus />
                      <button onClick={() => setConfirm({ status: "Selesai" })} disabled={action.loading || !action.date} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50">{action.loading ? "..." : "Konfirmasi Selesai"}</button>
                    </div>
                  )}

                  {action.type === "Siap Diambil" && (
                    <div className="mt-3">
                      <button onClick={() => setConfirm({ status: "Siap Diambil" })} disabled={action.loading} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50">{action.loading ? "..." : "Konfirmasi Siap Diambil"}</button>
                    </div>
                  )}

                  {waResult && (
                    <div className="mt-4 rounded-lg border border-[#C7D2E3] bg-[#F4F7FB] p-3">
                      <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Notifikasi WhatsApp</p>
                      {waResult.number ? (
                        <a href={waLink(waResult.number, waResult.text)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                          Kirim WA ke Pemohon
                        </a>
                      ) : (
                        <p className="text-xs text-slate-500">Nomor WA pemohon tidak tersedia</p>
                      )}
                      <p className="mt-2 whitespace-pre-wrap rounded bg-white p-2.5 text-xs leading-relaxed text-slate-600">{waResult.text}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-sm text-red-500">Gagal memuat detail</div>
            )}
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <ConfirmDialog
        open={confirm !== null}
        title={confirm ? `Ubah status ke "${confirm.status}"?` : ""}
        message="Tindakan ini akan mengubah status permohonan dan mengirim notifikasi WhatsApp ke pemohon."
        confirmLabel={confirm?.status ?? ""}
        confirmClass={
          confirm?.status === "Siap Diambil"
            ? "bg-emerald-600 hover:bg-emerald-700"
            : confirm?.status === "Tidak Valid"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
        }
        loading={action.loading}
        onConfirm={() => confirm && handleAction(confirm.status)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
