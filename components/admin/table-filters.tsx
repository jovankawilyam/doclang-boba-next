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

function selectCls(): string {
  return "rounded-lg border px-3 py-2 text-xs font-medium focus:outline-none transition-colors";
}

export function TableFilters({ statusFilter, layananFilter, searchInput, showLayananFilter = true, onStatusChange, onLayananChange, onSearchChange, onExport }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className={selectCls()}
        style={{ borderColor: "var(--admin-border-input)", backgroundColor: "var(--admin-bg-card)", color: "var(--admin-text-body)" }}
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
          className={selectCls()}
          style={{ borderColor: "var(--admin-border-input)", backgroundColor: "var(--admin-bg-card)", color: "var(--admin-text-body)" }}
        >
          <option value="">Semua Layanan</option>
          {LAYANAN_OPTIONS.filter(Boolean).map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      )}

      <div className="relative min-w-[180px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--admin-text-secondary)" }} />
        <input
          type="text"
          placeholder="Cari ID Pengajuan..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border py-2 pl-9 pr-3 text-xs focus:outline-none transition-colors"
          style={{
            borderColor: "var(--admin-border-input)",
            backgroundColor: "var(--admin-bg-card)",
            color: "var(--admin-text-body)",
          }}
        />
      </div>

      <button
        onClick={onExport}
        className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors"
        style={{
          borderColor: "var(--admin-border-input)",
          backgroundColor: "var(--admin-bg-card)",
          color: "var(--admin-text-body)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--admin-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--admin-bg-card)";
        }}
      >
        <Download className="h-3.5 w-3.5" />
        Export CSV
      </button>
    </div>
  );
}
