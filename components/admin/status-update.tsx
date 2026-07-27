import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { WaNotification } from "./wa-notification";
import { getAuthHeaders } from "@/lib/admin-fetch";

function cleanWaNumber(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("0")) return "62" + d.slice(1);
  if (d.startsWith("62")) return d;
  if (d.startsWith("8")) return "62" + d;
  return d;
}

function waLink(number: string, text: string): string {
  return `https://wa.me/${cleanWaNumber(number)}?text=${encodeURIComponent(text)}`;
}

type DetailData = Record<string, string>;

type Props = {
  id: string;
  data: DetailData | null;
  onUpdated: () => void;
  toast: (type: "success" | "error", message: string) => void;
};

export function StatusUpdate({ id, data, onUpdated, toast }: Props) {
  const [actionType, setActionType] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [waResult, setWaResult] = useState<{ number: string; text: string } | null>(null);

  async function handleAction(status: string) {
    setLoading(true);
    setWaResult(null);
    setConfirm(null);
    try {
      const body: Record<string, string> = { id, status };
      if (status === "Tidak Valid") body.reason = reason;
      if (status === "Selesai") body.tglPengambilan = date;
      const res = await fetch("/api/admin/permohonan", {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        const waNumber = data?.["Nomor Whatsapp Pemohon"] ?? "";
        const nama = data?.["Nama Pemohon"] ?? "";
        let waText = "";
        if (status === "Siap Diambil")
          waText = `Yth. ${nama},\n\nPermohonan Anda (${id}) telah DIVALIDASI. Silakan ambil dokumen di KPKNL Bogor.\n\nTerima kasih.`;
        else if (status === "Tidak Valid")
          waText = `Yth. ${nama},\n\nPermohonan Anda (${id}) DITOLAK.\nAlasan: ${reason || "-"}\n\nSilakan lengkapi persyaratan dan ajukan ulang.\n\nTerima kasih.`;
        else if (status === "Selesai")
          waText = `Yth. ${nama},\n\nPermohonan Anda (${id}) telah SELESAI. Dokumen dapat diambil pada ${date || "-"} di KPKNL Bogor.\n\nTerima kasih.`;
        setWaResult({ number: waNumber, text: waText });
        toast("success", `Status berhasil diubah menjadi ${status}`);
        onUpdated();
      } else {
        toast("error", json.error || "Gagal mengubah status");
      }
    } catch {
      toast("error", "Gagal mengubah status");
    } finally {
      setLoading(false);
    }
  }

  const BUTTONS = [
    { label: "Siap Diambil", value: "Siap Diambil", active: "bg-emerald-600 text-white", inactive: "border border-emerald-300 text-emerald-700 hover:bg-emerald-50" },
    { label: "Tidak Valid", value: "Tidak Valid", active: "bg-red-600 text-white", inactive: "border border-red-300 text-red-700 hover:bg-red-50" },
    { label: "Selesai", value: "Selesai", active: "bg-blue-600 text-white", inactive: "border border-blue-300 text-blue-700 hover:bg-blue-50" },
  ];

  return (
    <div className="border-t pt-4" style={{ borderColor: "var(--admin-border)" }}>
      <p className="mb-3 text-xs font-bold tracking-wider uppercase" style={{ color: "var(--admin-text-primary)" }}>Update Status</p>

      <div className="flex flex-wrap gap-2">
        {BUTTONS.map((s) => (
          <button
            key={s.label}
            onClick={() => {
              setActionType(actionType === s.value ? "" : s.value);
              setReason("");
              setDate("");
              setWaResult(null);
            }}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
              actionType === s.value ? s.active : s.inactive
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {actionType === "Tidak Valid" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Alasan penolakan..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-w-[240px] flex-1 rounded-lg border px-3 py-2 text-xs"
            style={{ borderColor: "var(--admin-border-input)", backgroundColor: "var(--admin-bg-card)", color: "var(--admin-text-body)" }}
            autoFocus
          />
          <button
            onClick={() => setConfirm("Tidak Valid")}
            disabled={loading || !reason.trim()}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "..." : "Konfirmasi Tolak"}
          </button>
        </div>
      )}

      {actionType === "Selesai" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border px-3 py-2 text-xs"
            style={{ borderColor: "var(--admin-border-input)", backgroundColor: "var(--admin-bg-card)", color: "var(--admin-text-body)" }}
            autoFocus
          />
          <button
            onClick={() => setConfirm("Selesai")}
            disabled={loading || !date}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "..." : "Konfirmasi Selesai"}
          </button>
        </div>
      )}

      {actionType === "Siap Diambil" && (
        <div className="mt-3">
          <button
            onClick={() => setConfirm("Siap Diambil")}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "..." : "Konfirmasi Siap Diambil"}
          </button>
        </div>
      )}

      {waResult && <WaNotification number={waResult.number} text={waResult.text} waLink={waLink(waResult.number, waResult.text)} />}

      <ConfirmDialog
        open={confirm !== null}
        title={confirm ? `Ubah status ke "${confirm}"?` : ""}
        message="Tindakan ini akan mengubah status permohonan dan mengirim notifikasi WhatsApp ke pemohon."
        confirmLabel={confirm ?? ""}
        confirmClass={
          confirm === "Siap Diambil"
            ? "bg-emerald-600 hover:bg-emerald-700"
            : confirm === "Tidak Valid"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
        }
        loading={loading}
        onConfirm={() => confirm && handleAction(confirm)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
