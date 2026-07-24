import { FileText, Clock, CheckCircle, XCircle, Inbox } from "lucide-react";

type Stats = {
  total: number;
  proses: number;
  siap_diambil: number;
  tidak_valid: number;
  selesai: number;
};

const CARD_CONFIG = [
  { label: "Total", key: "total" as const, color: "text-[#123C69]", bg: "bg-[#EEF3FA]", border: "border-[#C7D2E3]", icon: FileText },
  { label: "Proses", key: "proses" as const, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
  { label: "Siap Diambil", key: "siap_diambil" as const, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle },
  { label: "Tidak Valid", key: "tidak_valid" as const, color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
  { label: "Selesai", key: "selesai" as const, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: Inbox },
];

export function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CARD_CONFIG.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-4 shadow-sm transition-shadow hover:shadow-md`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{s.label}</span>
              <Icon className={`h-4 w-4 ${s.color} opacity-60`} />
            </div>
            <p className={`mt-1.5 text-2xl font-bold ${s.color}`}>{stats[s.key]}</p>
          </div>
        );
      })}
    </div>
  );
}
