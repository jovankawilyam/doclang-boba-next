"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
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

function normalizeStatus(status: string): string {
  const s = status.toLowerCase();
  if (s === "siap diambil") return "Siap Diambil";
  if (s === "tidak valid") return "Tidak Valid";
  if (s === "selesai") return "Selesai";
  return "";
}

export function StatusUpdate({ id, data, onUpdated, toast }: Props) {
  const [actionType, setActionType] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);

  async function handleAction(status: string) {
    setLoading(true);
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
        toast("success", `Status berhasil diubah menjadi ${status}`);

        if (status === "Siap Diambil" || status === "Tidak Valid") {
          const waNumber = data?.["Nomor Whatsapp Pemohon"] ?? "";
          const nama = data?.["Nama Pemohon"] ?? "";
          let waText = "";
          if (status === "Siap Diambil")
            waText = `Yth. Bapak/Ibu *${nama}*,\n\n Dengan ini, kami sampaikan bahwa permohonan Anda dengan nomor pengajuan *${id}* telah diproses dan *SIAP DIAMBIL*.\n\nSilakan datang ke KPKNL Bogor untuk mengambil dokumen Anda.\n\nAtas perhatian dan kerja samanya, kami ucapkan terima kasih.\n\nHormat kami, KPKNL Bogor`;
          else if (status === "Tidak Valid")
            waText = `Yth. Bapak/Ibu *${nama}*,\n\n Dengan ini, kami sampaikan bahwa permohonan Anda dengan nomor pengajuan *${id}* *TIDAK VALID*.\n\nAlasan: ${reason || "-"}\n\nSilakan lengkapi persyaratan yang diperlukan dan ajukan kembali permohonan Anda. Apabila memerlukan bantuan, silahkan untuk menghubungi kami.\n\nAtas perhatian dan kerja samanya, kami ucapkan terima kasih.\n\nHormat kami, KPKNL Bogor`;
          if (waNumber) {
            window.open(waLink(waNumber, waText), "_blank");
          }
        }

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

  const activeStatus = actionType ?? normalizeStatus(data?.["Status Proses"] ?? "");

  const BUTTONS = [
    { label: "Siap Diambil", value: "Siap Diambil", color: "#005FAC" },
    { label: "Tidak Valid", value: "Tidak Valid", color: "#DC2626" },
    { label: "Selesai", value: "Selesai", color: "#02A54F" },
  ];

  return (
    <div className="border-t pt-4" style={{ borderColor: "var(--admin-border)" }}>
      <p className="mb-3 text-xs font-bold tracking-wider uppercase" style={{ color: "var(--admin-text-primary)" }}>Update Status</p>

      <div className="flex flex-wrap gap-2">
        {BUTTONS.map((s) => {
          const isActive = activeStatus === s.value;
          return (
            <button
              key={s.label}
              onClick={() => {
                setActionType(isActive ? null : s.value);
                setReason("");
                setDate("");
              }}
              disabled={loading}
              className="rounded-lg px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50"
              style={{
                backgroundColor: isActive ? s.color : "transparent",
                color: isActive ? "#fff" : s.color,
                border: `1px solid ${isActive ? s.color : s.color}40`,
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = `${s.color}10`; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {s.label}
            </button>
          );
        })}
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
            className="rounded-lg px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            style={{ backgroundColor: "#DC2626" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#B91C1C"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#DC2626"}
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
            className="rounded-lg px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            style={{ backgroundColor: "#02A54F" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#028840"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#02A54F"}
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
            className="rounded-lg px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            style={{ backgroundColor: "#005FAC" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#004A8A"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#005FAC"}
          >
            {loading ? "..." : "Konfirmasi Siap Diambil"}
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirm !== null}
        title={confirm ? `Ubah status ke "${confirm}"?` : ""}
        message="Tindakan ini akan mengubah status permohonan dan membuka WhatsApp dengan template pesan."
        confirmLabel={confirm ?? ""}
        confirmClass={
          confirm === "Siap Diambil"
            ? "bg-[#005FAC] hover:bg-[#004A8A]"
            : confirm === "Tidak Valid"
              ? "bg-[#DC2626] hover:bg-[#B91C1C]"
              : "bg-[#02A54F] hover:bg-[#028840]"
        }
        loading={loading}
        onConfirm={() => confirm && handleAction(confirm)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
