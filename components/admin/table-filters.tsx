import { Search, Download } from "lucide-react";

const STATUS_OPTIONS = ["", "proses", "siap diambil", "tidak valid", "selesai"];
const LAYANAN_OPTIONS = ["", "Kuitansi", "Kutipan RL", "Validasi PPh"];

type Props = {
  statusFilter: string;
  layananFilter: string;
  searchInput: string;
  showLayananFilter?: boolean;
  onStatusChange: (v: string) => void;
  onLayananChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onExport: () => void;
};

export function TableFilters({ statusFilter, layananFilter, searchInput, showLayananFilter = true, onStatusChange, onLayananChange, onSearchChange, onExport }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-lg border border-[#C7D2E3] bg-white px-3 py-2 text-xs font-medium text-slate-600 focus:border-[#1E56A0] focus:outline-none"
      >
        <option value="">Semua Status</option>
        {STATUS_OPTIONS.filter(Boolean).map((s) => (
          <option key={s} value={s}>
            {s.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
          </option>
        ))}
      </select>

      {showLayananFilter && (
        <select
          value={layananFilter}
          onChange={(e) => onLayananChange(e.target.value)}
          className="rounded-lg border border-[#C7D2E3] bg-white px-3 py-2 text-xs font-medium text-slate-600 focus:border-[#1E56A0] focus:outline-none"
        >
          <option value="">Semua Layanan</option>
          {LAYANAN_OPTIONS.filter(Boolean).map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      )}

      <div className="relative min-w-[180px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari ID Pengajuan..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-[#C7D2E3] bg-white py-2 pl-9 pr-3 text-xs focus:border-[#1E56A0] focus:outline-none"
        />
      </div>

      <button
        onClick={onExport}
        className="flex items-center gap-1.5 rounded-lg border border-[#C7D2E3] bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-[#F4F7FB]"
      >
        <Download className="h-3.5 w-3.5" />
        Export CSV
      </button>
    </div>
  );
}
