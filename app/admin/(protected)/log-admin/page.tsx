"use client";

import { useEffect, useRef, useState } from "react";
import { Pagination } from "@/components/admin/pagination";
import { Clock } from "lucide-react";
import { getAuthHeaders } from "@/lib/admin-fetch";

type AuditEntry = {
  id: number;
  actorName: string;
  action: string;
  targetUsername: string;
  detail: string;
  createdAt: string;
};

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  reset_password: { label: "Reset Password", color: "#DC2626" },
  create_account: { label: "Tambah Akun", color: "#02A54F" },
  update_account: { label: "Ubah Akun", color: "#005FAC" },
  delete_account: { label: "Hapus Akun", color: "#B91C1C" },
  change_password: { label: "Ubah Password Sendiri", color: "#64748B" },
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function LogAdminPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const id = ++fetchIdRef.current;
    fetch(`/api/admin/audit?page=${page}`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((json) => {
        if (id !== fetchIdRef.current) return;
        if (json.success) {
          setLogs(json.data);
          setTotal(json.total);
          setTotalPages(json.totalPages);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (id === fetchIdRef.current) setLoading(false);
      });
  }, [page]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--admin-text-primary)" }}>Log Aktivitas Admin</h1>
        <p className="mt-1 text-xs" style={{ color: "var(--admin-text-secondary)" }}>
          Catatan riwayat perubahan akun, reset password, dan tindakan administratif lainnya.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border shadow-sm" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2" style={{ borderColor: "var(--admin-border-input)", borderTopColor: "var(--admin-text-primary)" }} />
            <span className="ml-3 text-sm" style={{ color: "var(--admin-text-secondary)" }}>Memuat log...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12" style={{ color: "var(--admin-text-secondary)" }}>
            <Clock className="mb-2 h-8 w-8" />
            <p className="text-sm">Belum ada aktivitas admin</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
            {logs.map((log) => {
              const actionInfo = ACTION_LABELS[log.action] ?? { label: log.action, color: "#64748B" };
              return (
                <div
                  key={log.id}
                  className="px-6 py-4 transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--admin-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: "var(--admin-text-secondary)" }}>
                        {formatDate(log.createdAt)}
                      </span>
                      <span className="text-xs font-bold" style={{ color: "var(--admin-text-primary)" }}>
                        {log.actorName}
                      </span>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
                      style={{ backgroundColor: actionInfo.color }}
                    >
                      {actionInfo.label}
                    </span>
                  </div>
                  <div className="mt-1 text-xs" style={{ color: "var(--admin-text-secondary)" }}>
                    Target: <span className="font-semibold" style={{ color: "var(--admin-text-body)" }}>{log.targetUsername || "-"}</span>
                    {log.detail && <span className="ml-2 font-mono text-[11px]">({log.detail})</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={(p) => { setPage(p); setLoading(true); }} />
      </div>
    </>
  );
}
