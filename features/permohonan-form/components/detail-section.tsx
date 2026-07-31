"use client";

import type { ChangeEvent } from "react";
import { FileText, Loader2, Send } from "lucide-react";

import {
  inputClassName,
  labelClassName,
  sectionClassName,
  serviceOptions,
} from "../constants";
import type {
  ApplicantRole,
  FieldHelpers,
  FileInputHelpers,
  RlObjectType,
  ServiceType,
} from "../types";
import { TextAreaField, TextField, UploadZone } from "./form-fields";

const radioCard = (
  active: boolean,
) => `flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm font-medium transition ${
  active
    ? "border-navy bg-navy text-white"
    : "border-slate-200 bg-white text-slate-900 hover:border-navy/30"
}`;

export const DetailSection = ({
  applicantRole,
  fieldHelpers,
  fileInputHelpers,
  isSubmitting,
  selectedRlObject,
  selectedService,
  setStep,
}: {
  applicantRole?: ApplicantRole;
  fieldHelpers: FieldHelpers;
  fileInputHelpers: FileInputHelpers;
  isSubmitting: boolean;
  selectedRlObject?: RlObjectType;
  selectedService?: ServiceType;
  setStep: (step: 1 | 2) => void;
}) => {
  const { register, renderError } = fieldHelpers;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Detail Permohonan
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Pilih layanan dan lengkapi dokumen yang diperlukan.
        </p>
      </div>

      <div className={sectionClassName}>
        <p className={labelClassName}>
          Tipe Pemohon <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(["pemenang", "kuasa"] as const).map((role) => (
            <label key={role} className={radioCard(applicantRole === role)}>
              <input
                type="radio"
                value={role}
                className="h-4 w-4 accent-white"
                {...register("peran_pemohon")}
              />
              {role === "pemenang" ? "Pemenang Lelang" : "Penerima Kuasa"}
            </label>
          ))}
        </div>
        {renderError("peran_pemohon")}
      </div>

      {applicantRole === "kuasa" && (
        <div className={sectionClassName}>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="h-5 w-5 text-navy" />
            <h3 className="text-sm font-bold text-slate-900">Data Pemberi Kuasa</h3>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <TextField
              form={fieldHelpers}
              name="nama_pemberi_kuasa"
              label="Nama Pemberi Kuasa"
            />
            <div className="space-y-1.5">
              <label htmlFor="jenis_identitas_pemberi_kuasa" className={labelClassName}>
                Jenis Identitas <span className="text-red-500">*</span>
              </label>
              <select
                id="jenis_identitas_pemberi_kuasa"
                className={inputClassName}
                {...register("jenis_identitas_pemberi_kuasa")}
              >
                <option value="KTP">KTP</option>
                <option value="SIM">SIM</option>
                <option value="Akta Pendirian">Akta Pendirian Perusahaan</option>
              </select>
            </div>
            <TextField
              form={fieldHelpers}
              name="nomor_identitas_pemberi_kuasa"
              label="Nomor Identitas"
            />
            <TextField
              form={fieldHelpers}
              name="nomor_wa_pemberi_kuasa"
              label="Nomor WhatsApp"
              placeholder="08xxxxxxxxxx"
            />
            <div className="md:col-span-2">
              <TextAreaField
                form={fieldHelpers}
                name="alamat_pemberi_kuasa"
                label="Alamat Pemberi Kuasa"
              />
            </div>
            <UploadZone
              form={fileInputHelpers}
              name="dokumen_identitas_pemberi_kuasa"
              label="Dokumen Identitas Pemberi Kuasa"
              note="PDF/JPG/PNG maks. 10MB"
            />
            <UploadZone
              form={fileInputHelpers}
              name="surat_kuasa"
              label="Surat Kuasa"
              note="PDF/JPG/PNG maks. 10MB"
            />
          </div>
        </div>
      )}

      <div className={sectionClassName}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <TextField
            form={fieldHelpers}
            name="kode_lot_lelang"
            label="Kode Lot Lelang"
            note="Maksimal 6 karakter (huruf kapital & angka)"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
            }}
          />
          <div className="space-y-1.5">
            <label htmlFor="jenis_layanan" className={labelClassName}>
              Jenis Layanan <span className="text-red-500">*</span>
            </label>
            <select
              id="jenis_layanan"
              className={inputClassName}
              {...register("jenis_layanan")}
            >
              <option value="">Pilih jenis layanan</option>
              {serviceOptions.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
            {renderError("jenis_layanan")}
          </div>
          <TextField
            form={fieldHelpers}
            name="tanggal_pelunasan"
            label="Tanggal Pelunasan"
            type="date"
          />
        </div>
      </div>

      {selectedService === "Pemberian Kuitansi Pembayaran Harga Lelang" && (
        <div className={sectionClassName}>
          <UploadZone
            form={fileInputHelpers}
            name="bukti_pelunasan_file"
            label="Bukti Pelunasan"
            note="PDF/JPG/PNG maks. 10MB"
          />
        </div>
      )}

      {selectedService === "Pemberian Kutipan Risalah Lelang" && (
        <div className={sectionClassName}>
          <p className={labelClassName}>
            Jenis Objek Risalah <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {(["tanah_bangunan", "kendaraan"] as const).map((obj) => (
              <label key={obj} className={radioCard(selectedRlObject === obj)}>
                <input
                  type="radio"
                  value={obj}
                  className="h-4 w-4 accent-white"
                  {...register("jenis_objek_risalah")}
                />
                {obj === "tanah_bangunan" ? "a. Tanah/Bangunan" : "b. Kendaraan"}
              </label>
            ))}
          </div>
          {renderError("jenis_objek_risalah")}

          {selectedRlObject === "tanah_bangunan" && (
            <UploadZone
              form={fileInputHelpers}
              name="bukti_validasi_sspd_bphtb"
              label="Bukti Validasi SSPD BPHTB"
              note="PDF/JPG/PNG maks. 10MB. Dokumen asli dilampirkan saat pengambilan"
            />
          )}
          <UploadZone
            form={fileInputHelpers}
            name="kuitansi_pembayaran_harga_lelang_file"
            label="Kuitansi Pembayaran Harga Lelang"
            note="PDF/JPG/PNG maks. 10MB"
          />
        </div>
      )}

      {selectedService === "Validasi PPh (1 Bidang)" && (
        <ValidasiPphFields
          fieldHelpers={fieldHelpers}
          fileInputHelpers={fileInputHelpers}
        />
      )}

      {applicantRole && (
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:ring-2 focus:ring-slate-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            Kembali
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy/90 focus:ring-2 focus:ring-navy/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Kirim Permohonan
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const ValidasiPphFields = ({
  fieldHelpers,
  fileInputHelpers,
}: {
  fieldHelpers: FieldHelpers;
  fileInputHelpers: FileInputHelpers;
}) => (
  <div className={sectionClassName}>
    <div className="rounded-lg border-l-4 border-navy bg-navy/[0.04] p-4 text-sm leading-6 text-slate-700">
      Untuk proses validasi PPh, siapkan: NPWP pemenang lelang, kuitansi,
      slip setor PPh, slip setor PBB atau berkas BPHTB yang menunjukkan NOP
      dan luas T/B yang tepat.
    </div>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <TextField
        form={fieldHelpers}
        name="nomor_kuitansi_pembayaran_harga_lelang"
        label="Nomor Kuitansi"
        placeholder="100/RL.150/32/2023"
      />
      <TextField
        form={fieldHelpers}
        name="nomor_objek_pajak"
        label="NOP"
        note="Input NOP sesuai Slip Setor PBB/BPHTB"
      />
      <div className="md:col-span-2">
        <TextField
          form={fieldHelpers}
          name="alamat_objek_lelang"
          label="Alamat Objek Lelang"
          placeholder="Jl. Kavling Mawar 3 RT.002 RW.07"
        />
      </div>
      <TextField
        form={fieldHelpers}
        name="ntpn"
        label="NTPN"
        placeholder="8C9ED4ESL70H8778"
      />
      <TextField
        form={fieldHelpers}
        name="npwp_pemenang_lelang"
        label="NPWP Pemenang Lelang"
        note="Angka saja, tanpa tanda hubung/titik"
      />
      <UploadZone
        form={fileInputHelpers}
        name="kuitansi_pembayaran_harga_lelang_file"
        label="Kuitansi Pembayaran Harga Lelang"
        note="PDF/JPG/PNG maks. 10MB"
      />
      <UploadZone
        form={fileInputHelpers}
        name="slip_setor_pbb_atau_bphtb"
        label="Slip Setor PBB / BPHTB"
        note="PDF/JPG/PNG maks. 10MB"
      />
      <UploadZone
        form={fileInputHelpers}
        name="slip_setor_pph"
        label="Slip Setor PPh"
        note="PDF/JPG/PNG maks. 10MB"
      />
      <UploadZone
        form={fileInputHelpers}
        name="npwp_pemenang_lelang_file"
        label="NPWP Pemenang Lelang"
        note="PDF/JPG/PNG maks. 10MB"
      />
    </div>
  </div>
);
