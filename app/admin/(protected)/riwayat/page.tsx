"use client";

import { useEffect, useRef, useState } from "react";
import { ToastContainer, useToast } from "@/components/toast";
import { StatusBadge } from "@/components/admin/status-badge";
import { Clock } from "lucide-react";
import { Pagination } from "@/components/admin/pagination";

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
    fetch(`/api/admin/riwayat?${new URLSearchParams({ page: String(page) })}`)
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
        <h1 className="text-xl font-bold text-[#123C69]">Riwayat Aktivitas</h1>
        <p className="mt-1 text-xs text-slate-500">Catatan perubahan status permohonan</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#D8E0EC] bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#C7D2E3] border-t-[#123C69]" />
            <span className="ml-3 text-sm text-slate-500">Memuat riwayat...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Clock className="mb-2 h-8 w-8" />
            <p className="text-sm">Belum ada aktivitas</p>
          </div>
        ) : (
          <div className="divide-y divide-[#D8E0EC]">
            {logs.map((log, i) => (
              <div key={i} className="px-6 py-4 transition-colors hover:bg-[#F4F7FB]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">{log.waktu}</span>
                    <span className="text-xs font-medium text-[#1E56A0]">{log.id}</span>
                  </div>
                  <span className="text-xs text-slate-500">{log.jenis_layanan}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500">Status:</span>
                  <StatusBadge status={log.status_baru} />
                </div>
                {log.keterangan && (
                  <p className="mt-1 text-xs text-slate-400">{log.keterangan}</p>
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
