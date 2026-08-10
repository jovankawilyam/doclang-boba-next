"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { useState } from "react";
import { StatsCards } from "./stats-cards";
import { StatusBadge } from "./status-badge";
import { ExternalLink, Inbox } from "lucide-react";

const COLORS = { Kuitansi: "#005FAC", "Kutipan RL": "#FAB715", "Validasi PPh": "#02A54F" };

const TREND_SERVICES = ["Kuitansi", "Kutipan RL", "Validasi PPh"] as const;
type TrendService = (typeof TREND_SERVICES)[number];
type TrendFilter = TrendService | "Semua";

type Stats = { total: number; proses: number; siap_diambil: number; tidak_valid: number; selesai: number };
type Row = Record<string, string>;

type Props = {
  stats: Stats;
  perLayanan: Record<string, Stats>;
  monthlyTrend: { bulan: string; Kuitansi: number; "Kutipan RL": number; "Validasi PPh": number }[];
  recent: Record<string, Row[]>;
  onOpenDetail: (id: string) => void;
};

function formatDate(iso: string): string {
  if (!iso || iso === "-") return "-";
  try {
    if (/^\d{2}\/\d{2}\/\d{4}/.test(iso)) return iso;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch { return iso; }
}

function cardCls(): string {
  return "rounded-xl border shadow-sm";
}

export function DashboardCharts({ stats, perLayanan, monthlyTrend, recent, onOpenDetail }: Props) {
  const [activeTrend, setActiveTrend] = useState<TrendFilter>("Semua");

  const kuitansi = perLayanan?.Kuitansi ?? { total: 0, proses: 0, siap_diambil: 0, tidak_valid: 0, selesai: 0 };
  const kutipanRL = perLayanan?.["Kutipan RL"] ?? { total: 0, proses: 0, siap_diambil: 0, tidak_valid: 0, selesai: 0 };
  const validasiPPh = perLayanan?.["Validasi PPh"] ?? { total: 0, proses: 0, siap_diambil: 0, tidak_valid: 0, selesai: 0 };

  const barData = [
    { name: "Proses", Kuitansi: kuitansi.proses, "Kutipan RL": kutipanRL.proses, "Validasi PPh": validasiPPh.proses },
    { name: "Siap Diambil", Kuitansi: kuitansi.siap_diambil, "Kutipan RL": kutipanRL.siap_diambil, "Validasi PPh": validasiPPh.siap_diambil },
    { name: "Tidak Valid", Kuitansi: kuitansi.tidak_valid, "Kutipan RL": kutipanRL.tidak_valid, "Validasi PPh": validasiPPh.tidak_valid },
    { name: "Selesai", Kuitansi: kuitansi.selesai, "Kutipan RL": kutipanRL.selesai, "Validasi PPh": validasiPPh.selesai },
  ];

  const pieData = [
    { name: "Kuitansi", value: kuitansi.total },
    { name: "Kutipan RL", value: kutipanRL.total },
    { name: "Validasi PPh", value: validasiPPh.total },
  ];

  const lineData = monthlyTrend?.map((m) => ({
    bulan: m.bulan.slice(5),
    Kuitansi: m.Kuitansi,
    "Kutipan RL": m["Kutipan RL"],
    "Validasi PPh": m["Validasi PPh"],
  })) ?? [];

  const filteredLineData =
    activeTrend === "Semua"
      ? lineData
      : lineData.map((m) => ({ bulan: m.bulan, [activeTrend]: m[activeTrend] }));

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={cardCls()} style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}>
          <div className="p-6">
            <h3 className="mb-5 text-base font-bold" style={{ color: "var(--admin-text-primary)" }}>Status per Layanan</h3>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--admin-text-secondary)" }} />
                <YAxis tick={{ fontSize: 12, fill: "var(--admin-text-secondary)" }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--admin-bg-card)", border: "1px solid var(--admin-border)", borderRadius: 8, fontSize: 13, color: "var(--admin-text-body)" }} />
                <Legend iconSize={12} wrapperStyle={{ fontSize: 12, color: "var(--admin-text-body)" }} />
                <Bar dataKey="Kuitansi" fill={COLORS.Kuitansi} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Kutipan RL" fill={COLORS["Kutipan RL"]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Validasi PPh" fill={COLORS["Validasi PPh"]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardCls()} style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}>
          <div className="p-6">
            <h3 className="mb-5 text-base font-bold" style={{ color: "var(--admin-text-primary)" }}>Distribusi Layanan</h3>
            <ResponsiveContainer width="100%" height={360}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={false}
                  style={{ fontSize: 12 }}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--admin-bg-card)", border: "1px solid var(--admin-border)", borderRadius: 8, fontSize: 13, color: "var(--admin-text-body)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={cardCls()} style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}>
        <div className="p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold" style={{ color: "var(--admin-text-primary)" }}>Tren Bulanan Permohonan</h3>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter grafik tren">
              {(["Semua", ...TREND_SERVICES] as TrendFilter[]).map((key) => {
                const isActive = activeTrend === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveTrend(key)}
                    className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
                    style={{
                      borderColor: isActive ? "var(--admin-text-primary)" : "var(--admin-border-input)",
                      backgroundColor: isActive ? "var(--admin-text-primary)" : "transparent",
                      color: isActive ? "#fff" : "var(--admin-text-body)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = "var(--admin-text-primary)";
                        e.currentTarget.style.color = "var(--admin-text-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = "var(--admin-border-input)";
                        e.currentTarget.style.color = "var(--admin-text-body)";
                      }
                    }}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={filteredLineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "var(--admin-text-secondary)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--admin-text-secondary)" }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "var(--admin-bg-card)", border: "1px solid var(--admin-border)", borderRadius: 8, fontSize: 13, color: "var(--admin-text-body)" }} />
              <Legend iconSize={12} wrapperStyle={{ fontSize: 12, color: "var(--admin-text-body)" }} />
              {activeTrend === "Semua" ? (
                <>
                  <Line type="monotone" dataKey="Kuitansi" stroke={COLORS.Kuitansi} strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Kutipan RL" stroke={COLORS["Kutipan RL"]} strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Validasi PPh" stroke={COLORS["Validasi PPh"]} strokeWidth={2} dot={{ r: 4 }} />
                </>
              ) : (
                <Line type="monotone" dataKey={activeTrend} stroke={COLORS[activeTrend]} strokeWidth={2} dot={{ r: 4 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {(["Kuitansi", "Kutipan RL", "Validasi PPh"] as const).map((layanan) => (
          <div key={layanan} className={cardCls()} style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}>
            <div className="border-b px-5 py-3" style={{ borderColor: "var(--admin-border)" }}>
              <h3 className="text-sm font-bold" style={{ color: "var(--admin-text-primary)" }}>{layanan}</h3>
            </div>
            {!(recent?.[layanan]?.length > 0) ? (
              <div className="flex flex-col items-center justify-center p-10" style={{ color: "var(--admin-text-secondary)" }}>
                <Inbox className="mb-2 h-8 w-8" />
                <p className="text-sm">Belum ada data</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg)" }}>
                      <th className="px-4 py-3 font-bold" style={{ color: "var(--admin-text-secondary)" }}>Tgl</th>
                      <th className="px-4 py-3 font-bold" style={{ color: "var(--admin-text-secondary)" }}>ID</th>
                      <th className="px-4 py-3 font-bold" style={{ color: "var(--admin-text-secondary)" }}>Status</th>
                      <th className="px-4 py-3 font-bold" style={{ color: "var(--admin-text-secondary)" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent[layanan].map((r, i) => (
                      <tr key={i} className="border-b last:border-0" style={{ borderColor: "var(--admin-border)" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--admin-hover)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td className="px-4 py-3" style={{ color: "var(--admin-text-secondary)" }}>{formatDate(r["Tgl Permintaan"])}</td>
                        <td className="px-4 py-3 font-medium" style={{ color: "var(--admin-text-primary)" }}>{r["ID Pengajuan"] || "-"}</td>
                        <td className="px-4 py-3"><StatusBadge status={r["Status Proses"]} /></td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => onOpenDetail(r["ID Pengajuan"])}
                            className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition-colors"
                            style={{
                              borderColor: "var(--admin-text-primary)",
                              color: "var(--admin-text-primary)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "var(--admin-text-primary)";
                              e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "var(--admin-text-primary)";
                            }}
                          >
                            <ExternalLink className="h-3 w-3" />
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
