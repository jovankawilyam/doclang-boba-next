"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ClipboardList,
  FileCheck,
  FileDown,
  Info,
  ShieldCheck,
  X,
  ChevronLeft,
} from "lucide-react";

const layanan = [
  {
    title: "Pemberian Kuitansi Pembayaran Harga Lelang",
    icon: <ClipboardList className="h-8 w-8 text-[#0B3D73]" />,
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
    icon: <FileCheck className="h-8 w-8 text-[#0B3D73]" />,
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
    icon: <ShieldCheck className="h-8 w-8 text-[#0B3D73]" />,
    items: [
      "KTP Pemohon / Pemenang",
      "Surat Kuasa asli (jika dikuasakan)",
      "Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*",
      "Kuitansi Pembayaran Harga Lelang asli",
      "Slip asli Setoran PPh",
      "Slip asli Setoran PBB atau berkas BPHTB yang menunjukkan NOP dan luas Tanah/Bagunan yang tepat",
      "Bukti Pelunasan",
    ],
    note: "*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum",
    warning:
      "Layanan validasi PPh penyelesaiannya menunggu hasil proses konfirmasi resmi dengan Kantor Pelayanan Pajak (KPP).",
  },
];

export default function PersyaratanPage() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white pb-20 text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 py-6 shadow-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-[auto_1fr_auto] items-center gap-3">
          <Link
            href="/"
            className="justify-self-start rounded-full p-2.5 transition-colors hover:bg-slate-100 sm:p-3"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600 sm:h-6 sm:w-6" />
          </Link>
          <span className="justify-self-center font-bold tracking-widest text-[#3388CC] uppercase">
            Persyaratan Layanan
          </span>
          <div aria-hidden="true" />
        </div>
      </nav>

      <main className="mx-auto mt-5 max-w-6xl px-4 md:mt-10 md:px-6">
        <div className="mb-8 grid gap-5 border-b border-[#D8E0EC] pb-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.35em] text-[#0B3D73] uppercase">
              Persyaratan Layanan
            </p>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl md:text-5xl">
              DOKUMEN YANG PERLU DISIAPKAN
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base md:mt-4 md:text-lg">
              Pilih layanan untuk melihat dokumen yang dibutuhkan sebelum mengajukan permohonan.
            </p>
          </div>
          <div className="hidden rounded-2xl border border-[#D8E0EC] bg-white px-4 py-4 shadow-sm lg:block sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">Unduh PDF Resmi</p>
                <p className="mt-1 text-xs text-slate-500">
                  Dapatkan salinan persyaratan resmi.
                </p>
              </div>
              <a
                href="/pdf/Persyaratan_Layanan.pdf"
                download
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-[#EEF3FA] px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                <FileDown className="h-4 w-4" />
                Unduh PDF
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {layanan.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(idx)}
              className="group flex cursor-pointer flex-col items-start gap-4 rounded-2xl border border-[#D8E0EC] bg-white px-5 py-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#3388CC] hover:shadow-md sm:px-6 sm:py-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#EEF3FA] shadow-sm transition-transform group-hover:scale-105">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[#0B3D73]">
                Lihat Persyaratan
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-[#D8E0EC] bg-white px-4 py-4 shadow-sm lg:hidden sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">Unduh PDF Resmi</p>
              <p className="mt-1 text-xs text-slate-500">
                Dapatkan salinan persyaratan resmi.
              </p>
            </div>
            <a
              href="/pdf/Persyaratan_Layanan.pdf"
              download
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-[#EEF3FA] px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              <FileDown className="h-4 w-4" />
              Unduh PDF
            </a>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-[#D8E0EC] bg-white px-5 py-7 shadow-sm sm:px-6 md:px-8 md:py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0B3D73] text-white">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950 sm:text-xl md:text-2xl">
                  Sudah siap mengajukan?
                </h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                  Setelah berkas lengkap, silakan lanjut ke formulir permohonan agar data dapat diproses lebih cepat.
                </p>
              </div>
            </div>
            <Link
              href="/form"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B3D73] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#082B52]"
            >
              Ajukan Permohonan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      {selected !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-[#D8E0EC] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#D8E0EC] px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF3FA] shadow-sm">
                  {layanan[selected].icon}
                </div>
                <h3 className="text-base font-semibold leading-snug text-slate-950 sm:text-lg">
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

            <div className="overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex flex-col gap-2">
                {layanan[selected].items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-[#EEF3FA] bg-[#F8FAFC] px-4 py-3 transition-shadow hover:shadow-sm"
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
                    <span className="text-sm leading-relaxed text-slate-700 sm:text-base">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
                {layanan[selected].note && (
                  <p className="text-sm leading-relaxed text-slate-500 whitespace-pre-line">
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
    </div>
  );
}
