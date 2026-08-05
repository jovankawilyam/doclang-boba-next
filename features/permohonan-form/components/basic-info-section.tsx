"use client";

import { ArrowRight } from "lucide-react";

import { inputClassName, labelClassName } from "../constants";
import type { FieldHelpers, FileInputHelpers } from "../types";
import { TextAreaField, TextField, UploadZone } from "./form-fields";

export const BasicInfoSection = ({
  fieldHelpers,
  fileInputHelpers,
  goToSlideTwo,
}: {
  fieldHelpers: FieldHelpers;
  fileInputHelpers: FileInputHelpers;
  goToSlideTwo: () => Promise<void>;
}) => {
  const { register, renderError } = fieldHelpers;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Informasi Pemohon
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Lengkapi identitas pemohon terlebih dahulu.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm md:px-8 md:py-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <TextField
            form={fieldHelpers}
            name="email_pemohon"
            label="Email"
            type="email"
            placeholder="nama@email.com"
          />
          <TextField
            form={fieldHelpers}
            name="nama_pemohon"
            label="Nama Pemohon"
          />
          <div className="space-y-1.5">
            <label htmlFor="jenis_identitas_pemohon" className={labelClassName}>
              Jenis Identitas <span className="text-red-500">*</span>
            </label>
            <select
              id="jenis_identitas_pemohon"
              className={inputClassName}
              {...register("jenis_identitas_pemohon")}
            >
              <option value="KTP">KTP</option>
              <option value="SIM">SIM</option>
              <option value="NPWP">NPWP</option>
            </select>
            {renderError("jenis_identitas_pemohon")}
          </div>
          <TextField
            form={fieldHelpers}
            name="nomor_identitas_pemohon"
            label="Nomor Identitas"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <div className="md:col-span-2">
            <TextAreaField
              form={fieldHelpers}
              name="alamat_pemohon"
              label="Alamat Pemohon"
            />
          </div>
          <TextField
            form={fieldHelpers}
            name="nomor_wa_pemohon"
            label="Nomor WhatsApp"
            placeholder="08xxxxxxxxxx"
          />
          <UploadZone
            form={fileInputHelpers}
            name="dokumen_identitas_pemohon"
            label="Dokumen Identitas"
            note="PDF/JPG/PNG maks. 10MB"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={goToSlideTwo}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-navy px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition hover:bg-navy/90 focus:ring-4 focus:ring-navy/20 focus:outline-none"
      >
        Lanjut ke Detail Layanan
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};
