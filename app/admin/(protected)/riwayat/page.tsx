"use client";

import { useEffect, useRef, useState } from "react";
import { ToastContainer, useToast } from "@/components/toast";
import { StatusBadge } from "@/components/admin/status-badge";
import { Clock } from "lucide-react";
import { Pagination } from "@/components/admin/pagination";
import { getAuthHeaders } from "@/lib/admin-fetch";

type LogEntry = {
  id: string;
  waktu: string;
  jenis_layanan: string;
  status_lama: string;
  status_baru: string;
  keterangan: string;
};

export default function RiwayatPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const fetchIdRef = useRef(0);
  const { toasts, toast, dismiss } = useToast();

  useEffect(() => {
    const id = ++fetchIdRef.current;
    fetch(`/api/admin/riwayat?${new URLSearchParams({ page: String(page) })}`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((json) => {
        if (id !== fetchIdRef.current) return;
        if (json.success) {
          setLogs(json.data);
          setTotal(json.total);
          setTotalPages(json.totalPages);
        } else {
          toast("error", json.error || "Gagal memuat riwayat");
        }
      })
      .catch(() => { if (id === fetchIdRef.current) toast("error", "Gagal memuat riwayat"); })
      .finally(() => { if (id === fetchIdRef.current) setLoading(false); });
  }, [page, toast]);

  function handlePageChange(p: number) {
    setPage(p);
    setLoading(true);
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--admin-text-primary)" }}>Riwayat Aktivitas</h1>
        <p className="mt-1 text-xs" style={{ color: "var(--admin-text-secondary)" }}>Catatan perubahan status permohonan</p>
      </div>

      <div className="overflow-hidden rounded-xl border shadow-sm" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2" style={{ borderColor: "var(--admin-border-input)", borderTopColor: "var(--admin-text-primary)" }} />
            <span className="ml-3 text-sm" style={{ color: "var(--admin-text-secondary)" }}>Memuat riwayat...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12" style={{ color: "var(--admin-text-secondary)" }}>
            <Clock className="mb-2 h-8 w-8" />
            <p className="text-sm">Belum ada aktivitas</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
            {logs.map((log, i) => (
              <div key={i} className="px-6 py-4 transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--admin-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: "var(--admin-text-secondary)" }}>{log.waktu}</span>
                    <span className="text-xs font-medium" style={{ color: "var(--admin-text-primary)" }}>{log.id}</span>
                  </div>
                  <span className="text-xs" style={{ color: "var(--admin-text-secondary)" }}>{log.jenis_layanan}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--admin-text-secondary)" }}>Status:</span>
                  <StatusBadge status={log.status_baru} />
                </div>
                {log.keterangan && (
                  <p className="mt-1 text-xs" style={{ color: "var(--admin-text-secondary)" }}>{log.keterangan}</p>
                )}
              </div>
            ))}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={handlePageChange} />
      </div>

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </>
  );
}
