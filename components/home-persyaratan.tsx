import {
  AlertCircle,
  ArrowRight,
  ClipboardList,
  FileCheck,
  Info,
  ShieldCheck,
} from "lucide-react";

const data = [
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

function CheckItem({ text }: { text: string }) {
  return (
    <div className="group flex items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_4px_12px_0_rgba(18,60,105,0.08)]">
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
      <span className="text-base leading-relaxed text-slate-700">{text}</span>
    </div>
  );
}

export default function HomePersyaratan() {
  return (
    <section id="persyaratan" className="relative overflow-hidden bg-bg-light px-4 py-16 md:px-6 md:py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-navy-light">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Persyaratan
          </div>
          <h2 className="text-3xl font-bold text-navy md:text-5xl">
            Siapkan Berkas Anda
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-500 md:text-lg">
            Lengkapi dokumen persyaratan sesuai layanan yang dipilih agar proses
            permohonan berjalan lancar.
          </p>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-navy to-orange" />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {data.map((section, idx) => (
            <div
              key={idx}
              className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-[0_4px_16px_0_rgba(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_0_rgba(18,60,105,0.12)]"
            >
              <div className="flex items-start gap-4 border-b border-slate-200 px-6 py-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm">
                  {section.icon}
                </div>
                <h3 className="pt-1 text-lg font-bold leading-snug text-navy">
                  {section.title}
                </h3>
              </div>

              <div className="flex flex-1 flex-col px-6 py-5">
                <div className="flex flex-1 flex-col gap-2">
                  {section.items.map((item, i) => (
                    <CheckItem key={i} text={item} />
                  ))}
                </div>

                <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
                  {section.note && (
                    <p className="text-sm leading-relaxed text-slate-400">
                      {section.note}
                    </p>
                  )}
                  {section.info && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <p className="text-sm leading-relaxed text-blue-800">
                        {section.info}
                      </p>
                    </div>
                  )}
                  {section.warning && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-900 bg-amber-50/90 px-4 py-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-900" />
                      <p className="text-sm leading-relaxed text-amber-900">
                        {section.warning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/form"
            className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-navy to-navy-light px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            Formulir
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
