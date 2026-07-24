import { ExternalLink, Inbox } from "lucide-react";
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
};

export function PermohonanTable({ rows, loading, onOpenDetail }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#C7D2E3] border-t-[#123C69]" />
        <span className="ml-3 text-sm text-slate-500">Memuat data...</span>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Inbox className="mb-2 h-8 w-8" />
        <p className="text-sm">Belum ada permohonan</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead>
          <tr className="border-b border-[#D8E0EC] bg-[#F4F7FB]">
            <th className="px-4 py-3 font-bold text-slate-500">Tgl Permintaan</th>
            <th className="px-4 py-3 font-bold text-slate-500">ID Pengajuan</th>
            <th className="px-4 py-3 font-bold text-slate-500">Jenis Layanan</th>
            <th className="px-4 py-3 font-bold text-slate-500">Kode Lot</th>
            <th className="px-4 py-3 font-bold text-slate-500">Status</th>
            <th className="px-4 py-3 font-bold text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="border-b border-[#D8E0EC] transition-colors hover:bg-[#F4F7FB] last:border-0"
            >
              <td className="px-4 py-3 text-slate-500">{formatDate(r["Tgl Permintaan"])}</td>
              <td className="px-4 py-3 font-medium text-[#1E56A0]">{r["ID Pengajuan"] || "-"}</td>
              <td className="px-4 py-3">{r["Jenis Layanan"] || "-"}</td>
              <td className="px-4 py-3 font-mono text-slate-600">{r["Kode Lot Lelang"] || "-"}</td>
              <td className="px-4 py-3"><StatusBadge status={r["Status Proses"]} /></td>
              <td className="px-4 py-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenDetail(r["ID Pengajuan"]); }}
                  className="flex items-center gap-1 rounded-md border border-[#1E56A0] px-2.5 py-1 text-xs font-semibold text-[#1E56A0] transition-colors hover:bg-[#1E56A0] hover:text-white"
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
  );
}
