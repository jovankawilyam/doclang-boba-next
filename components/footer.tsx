import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-[#005FAC] py-16 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2 md:px-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-6">
            <Image
              src="/images/NAGARA-DANA-RAKCA.png"
              alt="Logo Nagara Dana Rakca"
              width={1072}
              height={1020}
              className="h-20 w-20 object-contain"
            />
            <Image
              src="/images/kpknl-bogor.png"
              alt="Logo KPKNL Bogor"
              width={354}
              height={335}
              className="h-20 w-20 object-contain"
            />
          </div>
          <div className="space-y-4 text-base leading-relaxed font-semibold md:text-lg">
            <p className="text-xl font-bold md:text-2xl">
              &copy; 2026 KPKNL Bogor
            </p>
            <p className="opacity-90">
              Jalan Veteran No. 45, Panaragan, Kecamatan Bogor Tengah, Kota
              Bogor, Jawa Barat 16125
            </p>
            
            <a
              href="https://www.instagram.com/jovankawilyamm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#005FAC] transition-colors duration-300 font-normal text-[px]"
            >
              build by : @jovankawilyamm
            </a>
          </div>
        </div>

        <div className="flex flex-col items-start gap-8 md:items-end">
          <div className="flex flex-col items-start md:items-end">
            <p className="mb-2 text-lg font-bold tracking-widest text-white/80 uppercase">
              Ikuti Kami
            </p>
            <div className="h-1.5 w-16 rounded-full bg-white" />
          </div>
          <div className="flex gap-5">
            {[
              {
                name: "youtube",
                url: "https://www.youtube.com/@kpknlbogor",
                color: "hover:bg-[#FF0000]",
              },
              {
                name: "instagram",
                url: "https://www.instagram.com/kpknl.bogor",
                color: "hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
              },
              {
                name: "tiktok",
                url: "https://www.tiktok.com/@kpknl.bogor",
                color: "hover:bg-black",
              },
            ].map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/20 text-white backdrop-blur-sm transition-all duration-300 ${item.color} hover:-translate-y-2 hover:shadow-2xl active:scale-90`}
              >
                <i
                  className={`fa-brands fa-${item.name} text-2xl transition-transform group-hover:scale-110`}
                />
              </a>
            ))}
          </div>
          <p className="text-left text-xs leading-loose font-bold tracking-widest text-white/80 uppercase md:text-right md:text-sm">
            Kantor Pelayanan Kekayaan Negara dan Lelang Bogor <br />
            <span className="text-white/80">@kpknlbogor</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
