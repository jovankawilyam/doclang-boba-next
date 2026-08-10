"use client";

import { useEffect, useRef, useState } from "react";
import { ToastContainer, useToast } from "@/components/toast";
import { TableFilters } from "@/components/admin/table-filters";
import { PermohonanTable } from "@/components/admin/permohonan-table";
import { Pagination } from "@/components/admin/pagination";
import { DetailModal } from "@/components/admin/detail-modal";
import { StatsCards } from "@/components/admin/stats-cards";
import { getAuthHeaders } from "@/lib/admin-fetch";

type MonitoringRow = Record<string, string>;
type Stats = { total: number; proses: number; siap_diambil: number; tidak_valid: number; selesai: number };

type Props = { layanan: string; title: string; description: string };

function escapeCsvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function ServicePage({ layanan, title, description }: Props) {
  const [rows, setRows] = useState<MonitoringRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<Stats>({ total: 0, proses: 0, siap_diambil: 0, tidak_valid: 0, selesai: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [detailId, setDetailId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const fetchIdRef = useRef(0);

  const { toasts, toast, dismiss } = useToast();

  useEffect(() => {
    const id = ++fetchIdRef.current;
    const params = new URLSearchParams();
    params.set("layanan", layanan);
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    params.set("page", String(page));
    fetch(`/api/admin/permohonan?${params.toString()}`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((json) => {
        if (id !== fetchIdRef.current) return;
        if (json.success) {
          setRows(json.data);
          setTotal(json.total);
          setTotalPages(json.totalPages);
          if (json.stats) setStats(json.stats);
        } else toast("error", json.error || "Gagal memuat data");
      })
      .catch(() => { if (id === fetchIdRef.current) toast("error", "Gagal memuat data. Periksa koneksi."); })
      .finally(() => { if (id === fetchIdRef.current) setLoading(false); });
  }, [statusFilter, search, page, toast, refreshKey, layanan]);

  function handleStatusChange(val: string) {
    setStatusFilter(val);
    setPage(1);
    setLoading(true);
  }

  function handlePageChange(p: number) {
    setPage(p);
    setLoading(true);
  }

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

  function handleExport() {
    const params = new URLSearchParams();
    params.set("layanan", layanan);
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    params.set("all", "true");

    toast("success", "Memulai export...");

    fetch(`/api/admin/permohonan?${params.toString()}`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error);
        const exportRows: MonitoringRow[] = json.data;
        const headers = ["Tgl Permintaan", "ID Pengajuan", "Jenis Layanan", "Kode Lot Lelang", "Status Proses"];
        const csvContent = [
          headers.join(","),
          ...exportRows.map((r) =>
            headers.map((h) => escapeCsvCell(r[h] || "")).join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${layanan.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast("success", "Export selesai");
      })
      .catch(() => toast("error", "Gagal export data"));
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--admin-text-primary)" }}>{title}</h1>
        <p className="mt-1 text-xs" style={{ color: "var(--admin-text-secondary)" }}>{description}</p>
      </div>

      <StatsCards stats={stats} />

      <div className="mt-6">
        <div className="mb-4">
          <TableFilters
            statusFilter={statusFilter}
            layananFilter={layanan}
            searchInput={searchInput}
            showLayananFilter={false}
            onStatusChange={handleStatusChange}
            onLayananChange={() => {}}
            onSearchChange={onSearchChange}
            onExport={handleExport}
          />
        </div>

        <div className="overflow-hidden rounded-xl border shadow-sm" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}>
          <PermohonanTable rows={rows} loading={loading} onOpenDetail={setDetailId} />
          <Pagination page={page} totalPages={totalPages} total={total} onPageChange={handlePageChange} />
        </div>
      </div>

      {detailId && (
        <DetailModal
          key={detailId}
          id={detailId}
          onClose={() => setDetailId("")}
          onUpdated={() => setRefreshKey((k) => k + 1)}
          toast={toast}
        />
      )}

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </>
  );
}
