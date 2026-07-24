const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  proses: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", label: "Proses" },
  "siap diambil": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", label: "Siap Diambil" },
  "tidak valid": { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400", label: "Tidak Valid" },
  selesai: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400", label: "Selesai" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? "";
  const style = STATUS_STYLES[s] ?? { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400", label: status || "-" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
