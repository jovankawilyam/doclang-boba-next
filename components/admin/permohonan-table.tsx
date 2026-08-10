import { ExternalLink, Inbox, Trash2 } from "lucide-react";
import { StatusBadge } from "./status-badge";

type Row = Record<string, string>;

function formatDate(iso: string): string {
  if (!iso || iso === "-") return "-";
  try {
    if (/^\d{2}\/\d{2}\/\d{4}/.test(iso)) return iso;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

type Props = {
  rows: Row[];
  loading: boolean;
  onOpenDetail: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function PermohonanTable({ rows, loading, onOpenDetail, onDelete }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-5 w-5 animate-spin rounded-full border-2" style={{ borderColor: "var(--admin-border-input)", borderTopColor: "var(--admin-text-primary)" }} />
        <span className="ml-3 text-sm" style={{ color: "var(--admin-text-secondary)" }}>Memuat data...</span>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12" style={{ color: "var(--admin-text-secondary)" }}>
        <Inbox className="mb-2 h-8 w-8" />
        <p className="text-sm">Belum ada permohonan</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg)" }}>
            <th className="px-4 py-3 font-bold" style={{ color: "var(--admin-text-secondary)" }}>Tgl Permintaan</th>
            <th className="px-4 py-3 font-bold" style={{ color: "var(--admin-text-secondary)" }}>ID Pengajuan</th>
            <th className="px-4 py-3 font-bold" style={{ color: "var(--admin-text-secondary)" }}>Jenis Layanan</th>
            <th className="px-4 py-3 font-bold" style={{ color: "var(--admin-text-secondary)" }}>Kode Lot</th>
            <th className="px-4 py-3 font-bold" style={{ color: "var(--admin-text-secondary)" }}>Status</th>
            <th className="px-4 py-3 font-bold" style={{ color: "var(--admin-text-secondary)" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="border-b transition-colors last:border-0"
              style={{ borderColor: "var(--admin-border)" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--admin-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <td className="px-4 py-3" style={{ color: "var(--admin-text-secondary)" }}>{formatDate(r["Tgl Permintaan"])}</td>
              <td className="px-4 py-3 font-medium" style={{ color: "var(--admin-text-primary)" }}>{r["ID Pengajuan"] || "-"}</td>
              <td className="px-4 py-3" style={{ color: "var(--admin-text-body)" }}>{r["Jenis Layanan"] || "-"}</td>
              <td className="px-4 py-3 font-mono" style={{ color: "var(--admin-text-secondary)" }}>{r["Kode Lot Lelang"] || "-"}</td>
              <td className="px-4 py-3"><StatusBadge status={r["Status Proses"]} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenDetail(r["ID Pengajuan"]); }}
                    className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors"
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
                  {onDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(r["ID Pengajuan"]); }}
                      className="flex items-center gap-1 rounded-md border border-red-500 px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                      Hapus
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
