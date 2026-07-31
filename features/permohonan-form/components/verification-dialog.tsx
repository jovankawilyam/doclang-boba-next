"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";

import type { DoclangFormValues, UploadedFileInfo } from "../types";
import type { FieldPath } from "react-hook-form";

const labels: Record<string, string> = {
  email_pemohon: "Email",
  nama_pemohon: "Nama Pemohon",
  jenis_identitas_pemohon: "Jenis Identitas",
  nomor_identitas_pemohon: "Nomor Identitas",
  alamat_pemohon: "Alamat",
  nomor_wa_pemohon: "No. WhatsApp",
  nama_pemberi_kuasa: "Nama Pemberi Kuasa",
  jenis_identitas_pemberi_kuasa: "Jenis Identitas Pemberi Kuasa",
  nomor_identitas_pemberi_kuasa: "Nomor Identitas Pemberi Kuasa",
  alamat_pemberi_kuasa: "Alamat Pemberi Kuasa",
  nomor_wa_pemberi_kuasa: "No. WhatsApp Pemberi Kuasa",
  kode_lot_lelang: "Kode Lot Lelang",
  jenis_layanan: "Jenis Layanan",
  tanggal_pelunasan: "Tanggal Pelunasan",
  nomor_kuitansi_pembayaran_harga_lelang: "Nomor Kuitansi",
  nomor_objek_pajak: "NOP",
  alamat_objek_lelang: "Alamat Objek Lelang",
  ntpn: "NTPN",
  npwp_pemenang_lelang: "NPWP Pemenang Lelang",
};

const fileLabels: Record<string, string> = {
  dokumen_identitas_pemohon: "Dokumen Identitas Pemohon",
  dokumen_identitas_pemberi_kuasa: "Dokumen Identitas Pemberi Kuasa",
  surat_kuasa: "Surat Kuasa",
  bukti_validasi_sspd_bphtb: "Bukti Validasi SSPD BPHTB",
  kuitansi_pembayaran_harga_lelang_file: "Kuitansi Pembayaran Harga Lelang",
  slip_setor_pbb_atau_bphtb: "Slip Setor PBB/BPHTB",
  slip_setor_pph: "Slip Setor PPh",
  npwp_pemenang_lelang_file: "NPWP Pemenang Lelang",
  bukti_pelunasan_file: "Bukti Pelunasan",
};

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 md:p-4">
      <p className="text-xs font-semibold text-navy">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

export function VerificationDialog({
  open,
  values,
  uploadedFiles,
  onConfirm,
  onCancel,
  isSubmitting,
}: {
  open: boolean;
  values: DoclangFormValues | null;
  uploadedFiles: Partial<
    Record<FieldPath<DoclangFormValues>, UploadedFileInfo>
  >;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  if (!open || !values) return null;

  const pemohonFields: (keyof DoclangFormValues)[] = [
    "email_pemohon",
    "nama_pemohon",
    "jenis_identitas_pemohon",
    "nomor_identitas_pemohon",
    "alamat_pemohon",
    "nomor_wa_pemohon",
  ];

  const kuasaFields: (keyof DoclangFormValues)[] = [
    "nama_pemberi_kuasa",
    "jenis_identitas_pemberi_kuasa",
    "nomor_identitas_pemberi_kuasa",
    "alamat_pemberi_kuasa",
    "nomor_wa_pemberi_kuasa",
  ];

  const layananFields: (keyof DoclangFormValues)[] = [
    "kode_lot_lelang",
    "jenis_layanan",
    "tanggal_pelunasan",
  ];

  const validasiPphFields: (keyof DoclangFormValues)[] = [
    "nomor_kuitansi_pembayaran_harga_lelang",
    "nomor_objek_pajak",
    "alamat_objek_lelang",
    "ntpn",
    "npwp_pemenang_lelang",
  ];

  const fileFields: (keyof DoclangFormValues)[] = [
    "dokumen_identitas_pemohon",
    "dokumen_identitas_pemberi_kuasa",
    "surat_kuasa",
    "bukti_pelunasan_file",
    "bukti_validasi_sspd_bphtb",
    "kuitansi_pembayaran_harga_lelang_file",
    "slip_setor_pbb_atau_bphtb",
    "slip_setor_pph",
    "npwp_pemenang_lelang_file",
  ];

  const isKuasa = values.peran_pemohon === "kuasa";
  const service = values.jenis_layanan;

  return (
      <div
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30 p-0 md:items-center md:p-6"
        onClick={onCancel}
      >
        <div
          className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-xl border border-slate-200 bg-white md:max-w-2xl md:rounded-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="shrink-0 border-b border-slate-200 px-5 pt-5 pb-4 md:px-8 md:pt-7">
            <p className="text-base font-bold text-slate-900 md:text-lg">Verifikasi Data</p>
            <p className="mt-1 text-sm text-slate-500">
              Periksa kembali data Anda sebelum dikirim.
            </p>
          </div>

          <div className="space-y-4 overflow-y-auto px-5 py-4 md:px-8">
          <SectionCard title="Data Pemohon">
            {pemohonFields.map((field) => {
              const v = values[field];
              return (
                <FieldRow
                  key={field}
                  label={labels[field] ?? field}
                  value={typeof v === "string" ? (v || "-") : "-"}
                />
              );
            })}
          </SectionCard>

          {isKuasa && (
            <SectionCard title="Data Pemberi Kuasa">
              {kuasaFields.map((field) => {
                const v = values[field];
                return (
                  <FieldRow
                    key={field}
                    label={labels[field] ?? field}
                    value={typeof v === "string" ? (v || "-") : "-"}
                  />
                );
              })}
            </SectionCard>
          )}

          <SectionCard title="Detail Layanan">
            {layananFields.map((field) => {
              const v = values[field];
              return (
                <FieldRow
                  key={field}
                  label={labels[field] ?? field}
                  value={typeof v === "string" ? (v || "-") : "-"}
                />
              );
            })}
          </SectionCard>

          {service === "Validasi PPh (1 Bidang)" && (
            <SectionCard title="Data Validasi PPh">
              {validasiPphFields.map((field) => {
                const v = values[field];
                return (
                  <FieldRow
                    key={field}
                    label={labels[field] ?? field}
                    value={typeof v === "string" ? (v || "-") : "-"}
                  />
                );
              })}
            </SectionCard>
          )}

          <SectionCard title="Dokumen">
            {fileFields
              .filter((field) => uploadedFiles[field])
              .map((field) => {
                const file = uploadedFiles[field];
                return (
                  <div
                    key={field}
                    className="flex items-center gap-2 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-slate-600">
                      {fileLabels[field] ?? field}
                    </span>
                    <span className="ml-auto text-xs text-slate-400">
                      {file?.name}
                    </span>
                  </div>
                );
              })}
            {fileFields.every((field) => !uploadedFiles[field]) && (
              <p className="text-sm text-slate-400">Tidak ada dokumen</p>
            )}
          </SectionCard>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 px-5 py-4 md:px-8">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 md:flex-initial"
          >
            Kembali
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90 disabled:cursor-not-allowed disabled:bg-slate-400 md:flex-initial"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Ya, Kirim
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
