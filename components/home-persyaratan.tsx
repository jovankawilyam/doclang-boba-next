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

export default function HomePersyaratan() {
  return (
    <section className="bg-bg-light px-4 py-16 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-navy md:text-5xl">
            Persyaratan Dokumen
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-base text-slate-500 md:text-xl">
            Lengkapi berkas Anda untuk mempercepat proses layanan pasca lelang.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {data.map((section, idx) => (
            <div
              key={idx}
              className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex items-start gap-3 border-b border-gray-200 px-5 py-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  {section.icon}
                </div>
                <h3 className="text-lg leading-snug font-semibold text-navy">
                  {section.title}
                </h3>
              </div>

              <div className="flex flex-1 flex-col px-5 py-4">
                <div className="grid flex-1 grid-cols-1 gap-2">
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5"
                    >
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span className="text-base leading-relaxed text-slate-700">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2.5 border-t border-gray-200 pt-4">
                  {section.note && (
                    <p className="text-base leading-relaxed text-slate-500">
                      {section.note}
                    </p>
                  )}
                  {section.info && (
                    <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <p className="text-base leading-relaxed text-blue-800">
                        {section.info}
                      </p>
                    </div>
                  )}
                  {section.warning && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <p className="text-base leading-relaxed text-amber-800">
                        {section.warning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/form"
            className="inline-flex items-center gap-2 rounded-lg bg-orange px-8 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-amber-600"
          >
            Klik Formulir
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}