"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { StatsCards } from "./stats-cards";
import { StatusBadge } from "./status-badge";
import { ExternalLink, Inbox } from "lucide-react";

const COLORS = { Kuitansi: "#1E56A0", "Kutipan RL": "#f28e2b", "Validasi PPh": "#10B981" };

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

export function DashboardCharts({ stats, perLayanan, monthlyTrend, recent, onOpenDetail }: Props) {
  const barData = [
    { name: "Proses", Kuitansi: perLayanan.Kuitansi.proses, "Kutipan RL": perLayanan["Kutipan RL"].proses, "Validasi PPh": perLayanan["Validasi PPh"].proses },
    { name: "Siap Diambil", Kuitansi: perLayanan.Kuitansi.siap_diambil, "Kutipan RL": perLayanan["Kutipan RL"].siap_diambil, "Validasi PPh": perLayanan["Validasi PPh"].siap_diambil },
    { name: "Tidak Valid", Kuitansi: perLayanan.Kuitansi.tidak_valid, "Kutipan RL": perLayanan["Kutipan RL"].tidak_valid, "Validasi PPh": perLayanan["Validasi PPh"].tidak_valid },
    { name: "Selesai", Kuitansi: perLayanan.Kuitansi.selesai, "Kutipan RL": perLayanan["Kutipan RL"].selesai, "Validasi PPh": perLayanan["Validasi PPh"].selesai },
  ];

  const pieData = [
    { name: "Kuitansi", value: perLayanan.Kuitansi.total },
    { name: "Kutipan RL", value: perLayanan["Kutipan RL"].total },
    { name: "Validasi PPh", value: perLayanan["Validasi PPh"].total },
  ];

  const lineData = monthlyTrend.map((m) => ({
    bulan: m.bulan.slice(5),
    Kuitansi: m.Kuitansi,
    "Kutipan RL": m["Kutipan RL"],
    "Validasi PPh": m["Validasi PPh"],
  }));

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[#D8E0EC] bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold text-[#123C69]">Status per Layanan</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Kuitansi" fill={COLORS.Kuitansi} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Kutipan RL" fill={COLORS["Kutipan RL"]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Validasi PPh" fill={COLORS["Validasi PPh"]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-[#D8E0EC] bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-[#123C69]">Distribusi Layanan</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name} (${value})`}
                labelLine={false}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-[#D8E0EC] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-[#123C69]">Tren Bulanan Permohonan</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="Kuitansi" stroke={COLORS.Kuitansi} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Kutipan RL" stroke={COLORS["Kutipan RL"]} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Validasi PPh" stroke={COLORS["Validasi PPh"]} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {(["Kuitansi", "Kutipan RL", "Validasi PPh"] as const).map((layanan) => (
          <div key={layanan} className="rounded-xl border border-[#D8E0EC] bg-white shadow-sm">
            <div className="border-b border-[#D8E0EC] px-4 py-3">
              <h3 className="text-sm font-bold text-[#123C69]">{layanan}</h3>
            </div>
            {recent[layanan].length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                <Inbox className="mb-2 h-6 w-6" />
                <p className="text-xs">Belum ada data</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#D8E0EC] bg-[#F4F7FB]">
                      <th className="px-3 py-2 font-bold text-slate-500">Tgl</th>
                      <th className="px-3 py-2 font-bold text-slate-500">ID</th>
                      <th className="px-3 py-2 font-bold text-slate-500">Status</th>
                      <th className="px-3 py-2 font-bold text-slate-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent[layanan].map((r, i) => (
                      <tr key={i} className="border-b border-[#D8E0EC] last:border-0 hover:bg-[#F4F7FB]">
                        <td className="px-3 py-2 text-slate-500">{formatDate(r["Tgl Permintaan"])}</td>
                        <td className="px-3 py-2 font-medium text-[#1E56A0]">{r["ID Pengajuan"] || "-"}</td>
                        <td className="px-3 py-2"><StatusBadge status={r["Status Proses"]} /></td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => onOpenDetail(r["ID Pengajuan"])}
                            className="flex items-center gap-1 rounded-md border border-[#1E56A0] px-2 py-1 text-xs font-semibold text-[#1E56A0] transition-colors hover:bg-[#1E56A0] hover:text-white"
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
