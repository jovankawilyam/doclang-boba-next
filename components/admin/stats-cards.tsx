import { FileText, Clock, CheckCircle, XCircle, Inbox } from "lucide-react";

type Stats = {
  total: number;
  proses: number;
  siap_diambil: number;
  tidak_valid: number;
  selesai: number;
};

const CARD_CONFIG = [
  { label: "Total", key: "total" as const, color: "var(--admin-text-primary)", bg: "var(--admin-bg)", border: "var(--admin-border)", icon: FileText },
  { label: "Proses", key: "proses" as const, color: "#92400e", bg: "#fffbeb", border: "#fde68a", icon: Clock },
  { label: "Siap Diambil", key: "siap_diambil" as const, color: "#065f46", bg: "#ecfdf5", border: "#a7f3d0", icon: CheckCircle },
  { label: "Tidak Valid", key: "tidak_valid" as const, color: "#991b1b", bg: "#fef2f2", border: "#fecaca", icon: XCircle },
  { label: "Selesai", key: "selesai" as const, color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe", icon: Inbox },
];

export function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CARD_CONFIG.map((s) => {
        const Icon = s.icon;
        const textColor = s.label === "Total" ? s.color : s.color;
        return (
          <div
            key={s.label}
            className="rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md"
            style={{
              backgroundColor: s.label === "Total" ? "var(--admin-bg)" : s.bg,
              borderColor: s.label === "Total" ? "var(--admin-border)" : s.border,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: "var(--admin-text-secondary)" }}>{s.label}</span>
              <Icon className="h-4 w-4 opacity-60" style={{ color: textColor }} />
            </div>
            <p className="mt-1.5 text-2xl font-bold" style={{ color: textColor }}>{stats[s.key]}</p>
          </div>
        );
      })}
    </div>
  );
}
