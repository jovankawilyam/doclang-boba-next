import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

const standarData = [
  { num: "1.", title: "Penetapan Status Penggunaan BMN", img: "/download/1.png" },
  { num: "2.", title: "Penjualan BMN Selain Tanah dan/atau Bangunan", img: "/download/2.png" },
  { num: "3.", title: "Penilaian Properti oleh Penilai Pemerintah", img: "/download/3.png" },
  { num: "4.", title: "Permohonan Keringanan Utang", img: "/download/4.png" },
  { num: "5.", title: "Surat Pernyataan Piutang Negara Lunas", img: "/download/5.png" },
  { num: "6.", title: "Penetapan Jadwal Lelang", img: "/download/6.png" },
  { num: "7.", title: "Pelaksanaan Lelang", img: "/download/7.png" },
  { num: "8.a.", title: "Pengembalian Uang Jaminan Penawaran Lelang (Tunai)", img: "/download/8a.png" },
  { num: "8.b.", title: "Pengembalian Uang Jaminan Penawaran Lelang (Virtual Account)", img: "/download/8b.png" },
  { num: "9.", title: "Pemberian Kutipan Risalah Lelang", img: "/download/9.png" },
  { num: "10.", title: "Penyetoran Hasil Bersih Lelang", img: "/download/10.png" },
  { num: "11.", title: "Penerbitan Salinan Risalah Lelang", img: "/download/11.png" },
];

export default function StandarPelayananPage() {
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
            Standar Pelayanan
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="py-8 text-center">
          <h1 className="text-3xl font-bold text-navy sm:text-4xl">
            Standar Pelayanan KPKNL Bogor
          </h1>
        </div>

        <div className="mb-8 rounded-xl bg-blue-50 px-20 py-10 text-center">
          <p className="text-xl leading-relaxed text-slate-700">
            <span className="font-bold">MAKLUMAT PELAYANAN</span>
            <br />
            &quot;Dengan ini kami berjanji dan sanggup untuk melaksanakan
            pelayanan sesuai standar pelayanan yang telah ditetapkan, memberikan
            pelayanan sesuai dengan keharusan dan melakukan perbaikan secara
            terus-menerus, serta bersedia menerima sanksi sesuai peraturan
            perundang-undangan yang berlaku apabila pelayanan yang diberikan
            tidak sesuai standar&quot;
          </p>
        </div>

        <p className="mb-6 text-center text-xl text-slate-600">
          Terdapat 11 Standar Pelayanan Pada KPKNL Bogor <br />
          sesuai Keputusan Dirjen Kekayaan Negara Nomor KEP-60/KN/2023
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {standarData.map((item) => (
            <div key={item.num} className="break-inside-avoid">
              <p className="mb-2 text-sm font-semibold text-navy">
                {item.num} {item.title}
              </p>
              <Image
                src={item.img}
                alt={`Standar ${item.num} ${item.title}`}
                width={600}
                height={450}
                className="w-full rounded border border-gray-200"
              />
            </div>
          ))}
        </div>

      <div className="mt-8 bg-blue-50 rounded-xl p-8  ">
        <div className="mt-8">
          <div className="overflow-auto rounded border border-gray-200">
            <iframe
              src="/pdf/KEP 60_KN_2023 - Standar Pelayanan DJKN - KPKNL.pdf"
              className="h-[600px] w-[800px]"
            />
          </div>
          <p className="mt-2 text-base">
            Untuk mengunduh Keputusan Dirjen Kekayaan Negara Nomor KEP-60/KN/2023
            silahkan klik{" "}
            <a
              href="/pdf/KEP 60_KN_2023 - Standar Pelayanan DJKN - KPKNL.pdf"
              download
              className="text-blue-600 underline hover:text-blue-800"
            >
              disini
            </a>
          </p>
        </div>

        <div className="mt-6">
          <div className="overflow-auto rounded border border-gray-200">
            <iframe
              src="/pdf/Ikhtisar Standar Pelayanan KPKNL.pdf"
              className="h-[600px] w-[800px]"
            />
          </div>
          <p className="mt-2 text-base">
            Untuk mengunduh Ikhtisar Standar Pelayanan KPKNL silahkan klik{" "}
            <a
              href="/pdf/Ikhtisar Standar Pelayanan KPKNL.pdf"
              download
              className="text-blue-600 underline hover:text-blue-800"
            >
              disini
            </a>
          </p>
        </div>
      </div>


        <div className="mt-10">
          <p className="mb-10 text-center text-xl font-bold text-navy ">
            Inovasi Percepatan Waktu Layanan KPKNL Bogor
          </p>
          <Image
            src="/download/image.png"
            alt="Inovasi Percepatan Waktu Layanan KPKNL Bogor"
            width={800}
            height={600}
            className="w-full rounded border border-gray-200"
          />
          <p className="mt-3 text-bold text-center bg-blue-50 py-5 ">
            Untuk mengunduh ketentuan mengenai Inovasi Percepatan Layanan pada
            KPKNL Bogor silahkan klik{" "}
            <a
              href="https://drive.google.com/file/d/14aZ8YRlzhpJVNyiOlyzSFke2mXfdzt6J/view"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              disini
            </a>
          </p>
        </div>

        <div className="mt-10">
          <p className="mb-10 text-center text-xl font-bold text-navy ">
            Inovasi Streamlining Permohonan Lelang KPKNL Bogor
          </p>

          <div className="overflow-auto rounded border border-gray-200">
            <iframe
              src="/pdf/SK Inovasi Streamlining Administrasi Permohonan Lelang Pada Kantor Pelayanan Kekayaan Negara Dan Lelang Bogor.pdf"
              className="h-[600px] w-[800px]"
            />
          </div>
          <p className="mt-2 text-base">
            Untuk mengunduh Keputusan Kepala KPKNL Bogor Nomor
            KEP-80/KNL.0803/2025 tentang Streamlining Administrasi Permohonan
            Lelang Pada KPKNL Bogor silahkan klik{" "}
            <a
              href="/pdf/SK Inovasi Streamlining Administrasi Permohonan Lelang Pada Kantor Pelayanan Kekayaan Negara Dan Lelang Bogor.pdf"
              download
              className="text-blue-600 underline hover:text-blue-800"
            >
              disini
            </a>
          </p>
        </div>

        <div className="mt-10 rounded-xl bg-blue-50 px-20 py-10 text-center">
          <p className="text-xl leading-relaxed text-slate-700">
            Terhadap tanggapan atas layanan KPKNL Bogor yang belum memenuhi
            harapan, KPKNL Bogor akan menyampaikan ucapan permintaan maaf
            tertulis oleh Kepala Kantor
          </p>
        </div>
      </div>
    </div>
  );
}
