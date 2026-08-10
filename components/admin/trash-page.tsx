"use client";

import { useEffect, useRef, useState } from "react";
import { Inbox, RotateCcw, Search, Trash2 } from "lucide-react";
import { ToastContainer, useToast } from "@/components/toast";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { getAuthHeaders } from "@/lib/admin-fetch";

type TrashRow = Record<string, string>;

const HEADERS = [
  "Tgl Permintaan",
  "Kode Lot Lelang",
  "ID Pengajuan",
  "Jenis Layanan",
  "Status Proses",
  "Tgl Dihapus",
];

const LAYANAN_OPTIONS = ["Kuitansi", "Kutipan RL", "Validasi PPh"];

export function TrashPage() {
  const [rows, setRows] = useState<TrashRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [layananFilter, setLayananFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ type: "restore" | "permanent"; id: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { toasts, toast, dismiss } = useToast();

  useEffect(() => {
    const params = new URLSearchParams();
    if (layananFilter) params.set("layanan", layananFilter);
    if (search) params.set("search", search);
    params.set("page", String(page));
    fetch(`/api/admin/sampah?${params.toString()}`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setRows(json.data);
          setTotal(json.total);
          setTotalPages(json.totalPages);
        } else toast("error", json.error || "Gagal memuat data sampah");
      })
      .catch(() => toast("error", "Gagal memuat data sampah. Periksa koneksi."))
      .finally(() => setLoading(false));
  }, [layananFilter, search, page, toast, refreshKey]);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  function onSearchChange(val: string) {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
      setLoading(true);
    }, 400);
  }

  async function handleAction() {
    if (!confirmAction) return;
    setActionLoading(true);
    const { type, id } = confirmAction;
    try {
      const url = type === "permanent"
        ? `/api/admin/sampah?id=${encodeURIComponent(id)}`
        : "/api/admin/sampah";
      const res = await fetch(url, {
        method: type === "permanent" ? "DELETE" : "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: type === "permanent" ? undefined : JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        toast("success", json.message || "Berhasil");
        setConfirmAction(null);
        setRefreshKey((k) => k + 1);
      } else {
        toast("error", json.error || "Gagal memproses data");
        setConfirmAction(null);
      }
    } catch {
      toast("error", "Gagal memproses data");
      setConfirmAction(null);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--admin-text-primary)" }}>Sampah</h1>
        <p className="mt-1 text-xs" style={{ color: "var(--admin-text-secondary)" }}>
          Permohonan yang dihapus. Pulihkan untuk mengembalikan, atau hapus permanen.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={layananFilter}
          onChange={(e) => { setLayananFilter(e.target.value); setPage(1); setLoading(true); }}
          className="rounded-lg border px-3 py-2 text-xs font-medium focus:outline-none transition-colors"
          style={{ borderColor: "var(--admin-border-input)", backgroundColor: "var(--admin-bg-card)", color: "var(--admin-text-body)" }}
        >
          <option value="">Semua Layanan</option>
          {LAYANAN_OPTIONS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <div className="relative min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--admin-text-secondary)" }} />
          <input
            type="text"
            placeholder="Cari ID Pengajuan..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-xs focus:outline-none transition-colors"
            style={{
              borderColor: "var(--admin-border-input)",
              backgroundColor: "var(--admin-bg-card)",
              color: "var(--admin-text-body)",
            }}
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border shadow-sm" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--admin-border)", backgroundColor: "var(--admin-bg-muted)" }}>
                {HEADERS.map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold" style={{ color: "var(--admin-text-secondary)" }}>{h}</th>
                ))}
                <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--admin-text-secondary)" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="px-4 py-10 text-center" style={{ color: "var(--admin-text-secondary)" }}>
                    Memuat data...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="px-4 py-12">
                    <div className="flex flex-col items-center gap-2" style={{ color: "var(--admin-text-secondary)" }}>
                      <Inbox className="h-8 w-8" />
                      <p>Sampah kosong</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r["ID Pengajuan"]} className="border-t transition-colors hover:bg-black/[0.02]" style={{ borderColor: "var(--admin-border)" }}>
                    <td className="px-4 py-3" style={{ color: "var(--admin-text-body)" }}>{r["Tgl Permintaan"]}</td>
                    <td className="px-4 py-3" style={{ color: "var(--admin-text-body)" }}>{r["Kode Lot Lelang"]}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--admin-text-primary)" }}>{r["ID Pengajuan"]}</td>
                    <td className="px-4 py-3" style={{ color: "var(--admin-text-body)" }}>{r["Jenis Layanan"]}</td>
                    <td className="px-4 py-3"><StatusBadge status={r["Status Proses"]} /></td>
                    <td className="px-4 py-3" style={{ color: "var(--admin-text-body)" }}>{r["Tgl Dihapus"]}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setConfirmAction({ type: "restore", id: r["ID Pengajuan"] })}
                          className="flex items-center gap-1 rounded-md border border-blue-600 px-2.5 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Pulihkan
                        </button>
                        <button
                          onClick={() => setConfirmAction({ type: "permanent", id: r["ID Pengajuan"] })}
                          className="flex items-center gap-1 rounded-md border border-red-600 px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="h-3 w-3" />
                          Hapus Permanen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={(p) => { setPage(p); setLoading(true); }} />
      </div>

      <ConfirmDialog
        open={confirmAction !== null}
        title={confirmAction?.type === "restore" ? "Pulihkan permohonan?" : "Hapus permanen?"}
        message={
          confirmAction?.type === "restore"
            ? "Permohonan akan dikembalikan ke daftar utama sesuai layanannya."
            : "Permohonan akan dihapus permanen dari database. Tindakan ini tidak bisa dibatalkan."
        }
        confirmLabel={confirmAction?.type === "restore" ? "Pulihkan" : "Hapus Permanen"}
        confirmClass={confirmAction?.type === "restore" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}
        loading={actionLoading}
        onConfirm={handleAction}
        onCancel={() => setConfirmAction(null)}
      />

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </>
  );
}
