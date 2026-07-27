const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  proses: { bg: "#FEF3C7", text: "#FAB715", dot: "#FAB715", label: "Proses" },
  "siap diambil": { bg: "#E6F0FA", text: "#005FAC", dot: "#005FAC", label: "Siap Diambil" },
  "tidak valid": { bg: "#FEE2E2", text: "#DC2626", dot: "#DC2626", label: "Tidak Valid" },
  selesai: { bg: "#E8F8F0", text: "#02A54F", dot: "#02A54F", label: "Selesai" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? "";
  const style = STATUS_STYLES[s] ?? { bg: "#f1f5f9", text: "#64748b", dot: "#94a3b8", label: status || "-" };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.dot }} />
      {style.label}
    </span>
  );
}
