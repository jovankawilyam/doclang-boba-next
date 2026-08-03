"use client";

import { useEffect, useRef, useState } from "react";
import { ToastContainer, useToast } from "@/components/toast";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { DetailModal } from "@/components/admin/detail-modal";
import { getAuthHeaders } from "@/lib/admin-fetch";

type Stats = { total: number; proses: number; siap_diambil: number; tidak_valid: number; selesai: number };
type Row = Record<string, string>;

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, proses: 0, siap_diambil: 0, tidak_valid: 0, selesai: 0 });
  const [perLayanan, setPerLayanan] = useState<Record<string, Stats>>({});
  const [monthlyTrend, setMonthlyTrend] = useState<{ bulan: string; Kuitansi: number; "Kutipan RL": number; "Validasi PPh": number }[]>([]);
  const [recent, setRecent] = useState<Record<string, Row[]>>({});
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const fetchIdRef = useRef(0);

  const { toasts, toast, dismiss } = useToast();

  useEffect(() => {
    const id = ++fetchIdRef.current;
    fetch("/api/admin/stats", { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((json) => {
        if (id !== fetchIdRef.current) return;
        if (json.success) {
          setStats(json.stats);
          setPerLayanan(json.perLayanan);
          setMonthlyTrend(json.monthlyTrend);
          setRecent(json.recent);
        } else toast("error", json.error || "Gagal memuat data");
      })
      .catch(() => { if (id === fetchIdRef.current) toast("error", "Gagal memuat data. Periksa koneksi."); })
      .finally(() => { if (id === fetchIdRef.current) setLoading(false); });
  }, [toast, refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2" style={{ borderColor: "var(--admin-border-input)", borderTopColor: "var(--admin-text-primary)" }} />
        <span className="ml-3 text-sm" style={{ color: "var(--admin-text-secondary)" }}>Memuat data dashboard...</span>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--admin-text-primary)" }}>Dashboard</h1>
        <p className="mt-1 text-xs" style={{ color: "var(--admin-text-secondary)" }}>Gambaran umum sebaran permohonan berdasarkan jenis layanan.</p>
      </div>

      <DashboardCharts
        stats={stats}
        perLayanan={perLayanan}
        monthlyTrend={monthlyTrend}
        recent={recent}
        onOpenDetail={setDetailId}
      />

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
