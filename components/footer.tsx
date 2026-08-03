import Image from "next/image";
import { getFooterSettings } from "@/lib/site-settings";

function toEmbedUrl(mapsUrl: string): string {
  try {
    const url = new URL(mapsUrl);
    const q = url.searchParams.get("q");
    if (q) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    }
    return `${url.origin}${url.pathname}?output=embed`;
  } catch {
    return "";
  }
}

export default async function Footer() {
  const footer = await getFooterSettings();
  const operationalLines = footer.operatingHours.split("\n").filter(Boolean);
  const embedUrl = toEmbedUrl(footer.mapsUrl);

  return (
    <footer className="w-full bg-[#082B52] text-white mt-10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_0.8fr] md:items-start">
          <div className="space-y-4 md:pr-6">
            <div className="flex items-center gap-4">
              <Image
                src="/images/NAGARA-DANA-RAKCA.png"
                alt="Logo Nagara Dana Rakca"
                width={1072}
                height={1020}
                className="h-12 w-12 object-contain sm:h-14 sm:w-14"
              />
              <Image
                src="/images/kpknl-bogor.png"
                alt="Logo KPKNL Bogor"
                width={354}
                height={335}
                className="h-12 w-12 object-contain sm:h-14 sm:w-14"
              />
            </div>
            <div className="space-y-2 text-sm leading-relaxed text-white/80">
              <p className="text-lg font-semibold whitespace-pre-line text-white">{footer.officeName}</p>
              <p className="whitespace-pre-line">{footer.address}</p>
            </div>
            <p className="whitespace-pre-line text-sm text-white/60">{footer.copyright}</p>
          </div>

          <div className="space-y-4 md:px-10 md:border-x md:border-white/10">
            <p className="text-xs font-bold tracking-[0.35em] text-white/55 uppercase">
              Jam Operasional
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/80">
              {operationalLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div className="space-y-4 md:pl-6 md:justify-self-end md:text-right">
            <p className="text-xs font-bold tracking-[0.35em] text-white/55 uppercase">
              Ikuti Kami
            </p>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <a
                href={footer.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube KPKNL Bogor"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10"
              >
                <i className="fa-brands fa-youtube text-xl" />
              </a>
              <a
                href={footer.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram KPKNL Bogor"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10"
              >
                <i className="fa-brands fa-instagram text-xl" />
              </a>
              <a
                href={footer.socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok KPKNL Bogor"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10"
              >
                <i className="fa-brands fa-tiktok text-xl" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8 sm:mt-12 sm:pt-10">
          <p className="text-xs font-bold tracking-[0.35em] text-white/55 uppercase">
            Lokasi
          </p>
          <a
            href={footer.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Buka lokasi di Google Maps"
            className="group relative mt-4 block overflow-hidden rounded-2xl border border-white/10 transition hover:border-white/25"
          >
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title="Lokasi KPKNL Bogor di peta"
                className="h-56 w-full border-0 sm:h-64"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="flex h-56 items-center justify-center bg-white/5 text-sm text-white/60 sm:h-64">
                {footer.address}
              </div>
            )}
            <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/50 via-transparent to-transparent p-4">
              <span className="max-w-[70%] text-xs font-semibold text-white/90">{footer.address}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition group-hover:bg-white/25">
                <i className="fa-solid fa-map-location-dot text-[10px]" />
                Buka di Google Maps
              </span>
            </div>
          </a>
        </div>
      </div>
    </footer>
  );
}
