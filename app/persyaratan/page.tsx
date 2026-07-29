import Link from "next/link";
import {
  FileCheck,
  ClipboardList,
  ShieldCheck,
  AlertCircle,
  Info,
  FileDown,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";

const data = [
  {
    title: "Pemberian Kuitansi Pembayaran Harga Lelang",
    icon: <ClipboardList className="h-6 w-6 text-navy-light" />,
    items: [
      "Fotokopi KTP Pemohon / Pemenang",
      "Surat Kuasa asli (jika dikuasakan)",
      "Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*",
      "Bukti asli Pelunasan Harga Lelang",
    ],
    note: "*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum",
  },
  {
    title: "Pemberian Kutipan Risalah Lelang",
    icon: <FileCheck className="h-6 w-6 text-navy-light" />,
    items: [
      "Fotokopi KTP Pemohon / Pemenang",
      "Surat Kuasa asli (jika dikuasakan)",
      "Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*",
      "Kuitansi Pembayaran Harga Lelang asli",
      "Asli Bukti Validasi SSPD BPHTB yang telah disetujui**",
      "Meterai sebanyak 2 buah",
    ],
    note: "*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum\n**Validasi BPHTB untuk objek lelang berupa tanah dan/atau bangunan",
    info: "Hardcopy dokumen persyaratan harap dilampirkan pada saat pengambilan fisik berkas.",
  },
  {
    title: "Validasi PPh (1 Bidang)",
    icon: <ShieldCheck className="h-6 w-6 text-navy-light" />,
    items: [
      "Fotokopi KTP Pemohon / Pemenang",
      "Surat Kuasa asli (jika dikuasakan)",
      "Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*",
      "Kuitansi Pembayaran Harga Lelang asli",
      "Slip asli / Setor PPh",
      "Slip asli / Setor PBB atau berkas BPHTB yang menunjukkan NOP dan luas Tanah/Bangunan yang tepat",
      "Bukti Pelunasan",
    ],
    note: "*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum",
    warning:
      "Layanan validasi PPh penyelesaiannya menunggu hasil proses konfirmasi resmi dengan Kantor Pelayanan Pajak (KPP).",
  },
];

export default function PersyaratanPage() {
  return (
    <div className="min-h-screen bg-bg-light pb-20 text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 py-6 shadow-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-3 items-center">
          <Link
            href="/"
            className="justify-self-start rounded-full p-3 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <span className="justify-self-center font-bold tracking-widest text-[#3388CC] uppercase">
            Persyaratan
          </span>
        </div>
      </nav>

      <div className="mx-auto mt-8 max-w-5xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-navy">
            Persyaratan Dokumen
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-admin-text-secondary">
            Lengkapi berkas Anda untuk mempercepat proses layanan pasca lelang.
          </p>

          <div className="mt-5 flex justify-center">
            <a
              href="/pdf/syarat_layanan_lelang.pdf"
              download
              className="inline-flex items-center gap-2 rounded-lg border border-admin-border bg-white px-4 py-2.5 text-sm font-medium text-admin-text-secondary shadow-sm transition-all hover:border-[#3388CC] hover:text-[#3388CC]"
            >
              <FileDown className="h-4 w-4" />
              Unduh Dokumen PDF Resmi
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {data.map((section, idx) => (
            <div
              key={idx}
              className="flex h-full flex-col rounded-xl border border-admin-border bg-white shadow-sm"
            >
              <div className="flex items-start gap-3 border-b border-admin-border px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  {section.icon}
                </div>
                <h2 className="text-base leading-snug font-semibold text-navy">
                  {section.title}
                </h2>
              </div>

              <div className="flex flex-1 flex-col px-5 py-4">
                <div className="grid flex-1 grid-cols-1 gap-2">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span className="text-sm leading-relaxed text-slate-700">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2.5 border-t border-admin-border pt-4">
                  {section.note && (
                    <p className="text-sm leading-relaxed text-admin-text-secondary">
                      {section.note}
                    </p>
                  )}

                  {section.info && (
                    <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <p className="text-sm leading-relaxed text-blue-800">
                        {section.info}
                      </p>
                    </div>
                  )}

                  {section.warning && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <p className="text-sm leading-relaxed text-amber-800">
                        {section.warning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center gap-3 rounded-xl border border-admin-border bg-white px-6 py-4 shadow-sm">
            <div className="text-left">
              <h3 className="text-sm font-semibold text-navy">
                Dokumen Sudah Lengkap?
              </h3>
              <p className="mt-0.5 text-sm text-admin-text-secondary">
                Pastikan dokumen bersih & terbaca sebelum mengunggah.
              </p>
            </div>
            <a
              href="/form"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#3388CC] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#005FAC]"
            >
              Isi Form Pengajuan
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
