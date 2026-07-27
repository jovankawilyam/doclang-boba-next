"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ClipboardList,
  FileCheck,
  Info,
  ShieldCheck,
  X,
} from "lucide-react";

const layanan = [
  {
    title: "Pemberian Kuitansi Pembayaran Harga Lelang",
    icon: <ClipboardList className="h-8 w-8 text-navy-light" />,
    items: [
      "KTP Pemohon / Pemenang",
      "Surat Kuasa asli (jika dikuasakan)",
      "Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*",
      "Bukti asli Pelunasan Harga Lelang",
    ],
    note: "*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum",
  },
  {
    title: "Pemberian Kutipan Risalah Lelang",
    icon: <FileCheck className="h-8 w-8 text-navy-light" />,
    items: [
      "KTP Pemohon / Pemenang",
      "Surat Kuasa asli (jika dikuasakan)",
      "Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*",
      "Kuitansi Pembayaran Harga Lelang asli",
      "Asli Bukti Validasi SSPD BPHTB yang telah disetujui**",
      "Meterai sebanyak 2 buah",
    ],
    note: "*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum\n**Validasi BPHTB untuk objek lelang berupa tanah dan/atau bangunan",
    info: "Hardcopy dokumen persyaratan harap dilampirkan pada saat pengambilan fisik berkas.",
  },
  {
    title: "Validasi PPh (1 Bidang)",
    icon: <ShieldCheck className="h-8 w-8 text-navy-light" />,
    items: [
      "KTP Pemohon / Pemenang",
      "Surat Kuasa asli (jika dikuasakan)",
      "Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*",
      "Kuitansi Pembayaran Harga Lelang asli",
      "Slip asli Setoran PPh",
      "Slip asli Setoran PBB atau berkas BPHTB yang menunjukkan NOP dan luas Tanah/Bangunan yang tepat",
      "Bukti Pelunasan",
    ],
    note: "*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum",
    warning:
      "Layanan validasi PPh penyelesaiannya menunggu hasil proses konfirmasi resmi dengan Kantor Pelayanan Pajak (KPP).",
  },
];

export default function HomePersyaratan() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section id="persyaratan" className="relative overflow-hidden bg-bg-light px-4 py-16 md:px-6 md:py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 hidden h-96 w-96 rounded-full bg-blue-100/60 blur-3xl md:block" />
        <div className="absolute left-1/2 top-1/2 hidden h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-100/40 blur-3xl md:block" />
      </div>
      <br /><br /><br /><br />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-navy md:text-5xl">
            Siapkan Berkas Anda
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-500 md:text-lg">
            Pilih jenis layanan untuk melihat persyaratan dokumen yang diperlukan.
          </p>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-navy to-orange" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {layanan.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(idx)}
              className="group flex cursor-pointer flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_4px_16px_0_rgba(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_0_rgba(18,60,105,0.12)]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm transition-transform group-hover:scale-110">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-navy">{item.title}</h3>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-orange">
                Lihat Persyaratan
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/form"
            className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-navy to-navy-light px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl md:px-8 md:py-4 md:text-base"
          >
            Ajukan Permohonan
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {selected !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm">
                  {layanan[selected].icon}
                </div>
                <h3 className="text-lg font-bold leading-snug text-navy">
                  {layanan[selected].title}
                </h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-2">
                {layanan[selected].items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_4px_12px_0_rgba(18,60,105,0.08)]"
                  >
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <svg
                        className="h-3 w-3 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-base leading-relaxed text-slate-700">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
                {layanan[selected].note && (
                  <p className="text-sm leading-relaxed text-slate-400">
                    {layanan[selected].note}
                  </p>
                )}
                {layanan[selected].info && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <p className="text-sm leading-relaxed text-blue-800">
                      {layanan[selected].info}
                    </p>
                  </div>
                )}
                {layanan[selected].warning && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <p className="text-sm leading-relaxed text-amber-800">
                      {layanan[selected].warning}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
