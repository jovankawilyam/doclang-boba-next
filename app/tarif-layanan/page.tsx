import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

export default function TarifLayananPage() {
  return (
    <div className="min-h-screen bg-white pb-20 text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 py-6 shadow-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-3 items-center">
          <Link
            href="/"
            className="justify-self-start rounded-full p-3 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <span className="justify-self-center font-bold tracking-widest text-[#3388CC] uppercase">
            Tarif Layanan
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="py-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-navy sm:text-4xl">
            Jenis dan Tarif Layanan Pada KPKNL Bogor
          </h1>
          <p className="mt-4 text-lg text-slate-600 py-5 bg-blue-50">
            Jenis dan Tarif Layanan berdasarkan{" "}
            <br />
            <span className="font-semibold">
              Peraturan Pemerintah RI No. 62 Tahun 2020
            </span>
          </p>
        </div>

        <div className="mt-8">
          <Image
            src="/download/Standar Biaya Tarif Layanan Lelang.png"
            alt="Standar Biaya Tarif Layanan Lelang"
            width={800}
            height={600}
            className="w-full rounded border border-gray-200"
          />
        </div>

        <div className="mt-8 rounded-xl bg-blue-50 px-8 py-6">
          <p className="text-lg font-semibold text-slate-700">
            Catatan
          </p>
          <p className="mt-2 text-base leading-relaxed text-slate-700">
            Lelang Sukarela Produk UMKM dapat diajukan bagi yang telah memenuhi
            dokumen persyaratan:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-base text-slate-700">
            <li>Nomor Induk Berusaha (NIB)</li>
            <li>Izin Usaha Mikro dan Kecil (IUMK)</li>
            <li>Surat Izin Usaha Perdagangan (SIUP)</li>
            <li>Izin Usaha Industri (untuk pelaku usaha menengah)</li>
          </ul>
        </div>

        <div className="mt-8">
          <Image
            src="/download/Bea dan Tarif Layanan Lainnya.png"
            alt="Standar Biaya Tarif Layanan Lelang Lainnya"
            width={800}
            height={600}
            className="w-full rounded border border-gray-200"
          />
        </div>
      </div>
    </div>
  );
}
