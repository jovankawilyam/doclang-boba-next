"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const images = useMemo(
    () => [
      "/profile/profile1.jpeg",
      "/profile/profile2.jpeg",
      "/profile/profile3.jpeg",
      "/profile/profile4.jpeg",
    ],
    [],
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [images.length]);

  const prevSlide = () =>
    setCurrent((v) => (v === 0 ? images.length - 1 : v - 1));
  const nextSlide = () => setCurrent((v) => (v + 1) % images.length);

  return (
    <section className="w-full overflow-hidden">
      <div className="relative w-full aspect-[16/11] overflow-hidden md:aspect-video md:max-h-[590px]">
        {images.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={index === 0 ? "slider" : ""}
            fill
            className={`object-cover object-center transition-opacity duration-700 ${
              current === index ? "opacity-100" : "opacity-0"
            }`}
            sizes="100vw"
            priority={index === 0}
            loading="eager"
          />
        ))}
        <div className="absolute inset-0 hidden md:block bg-gradient-to-b from-black/80 via-black/55 to-black/75 " />
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-white transition hover:bg-white/40"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-white transition hover:bg-white/40"
        >
          ›
        </button>
        <div className="absolute inset-0 z-10 hidden select-none flex-col items-start justify-start text-left md:flex md:px-16 md:pt-12 lg:pt-16">
          <div className="flex items-center gap-4">
            <Image
              className="h-12 w-auto object-contain drop-shadow-lg md:h-16"
              src="/images/NAGARA-DANA-RAKCA.png"
              alt="Nagara Dana Rakça"
              width={1072}
              height={1020}
              sizes="120px"
            />
            <Image
              className="h-12 w-auto object-contain drop-shadow-lg md:h-16"
              src="/images/kpknl-bogor.png"
              alt="KPKNL Bogor"
              width={354}
              height={335}
              sizes="120px"
            />
          </div>
          <div className="mt-16 flex max-w-4xl flex-col items-start gap-2 text-left md:mt-20 md:gap-3">
            <h1
              className="animate-fade-slide-up text-5xl font-bold tracking-[0.1em] text-white opacity-0 md:text-7xl"
              style={{
                textShadow: "0 4px 14px rgba(0,0,0,0.8)",
                animationDelay: "220ms",
              }}
            >
              DOCLANG BOBA
            </h1>

            <p
              className="animate-fade-slide-up text-base font-semibold tracking-[0.06em] text-white/95 opacity-0 md:text-2xl"
              style={{
                textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                animationDelay: "280ms",
              }}
            >
              Dokumen Pasca Lelang Bogor Bageur
            </p>

            <p
              className="mt-3 max-w-2xl animate-fade-slide-up text-sm leading-relaxed text-white/90 opacity-0 md:mt-4 md:text-base"
              style={{
                textShadow: "0 2px 8px rgba(0,0,0,0.75)",
                animationDelay: "380ms",
              }}
            >
              Layanan pengajuan dokumen pasca lelang secara daring yang cepat,
              tertib, dan mudah diakses.
            </p>

            <Link
              href="#persyaratan"
              className="mt-6 inline-flex animate-fade-slide-up items-center rounded-xl border-2 border-white px-6 py-3 text-sm font-semibold text-white opacity-0 transition-all duration-300 hover:bg-white hover:text-[#123C69] hover:shadow-lg md:mt-8 md:text-base"
              style={{ animationDelay: "480ms" }}
            >
              Lihat Persyaratan
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-20 hidden justify-center gap-2 pb-4 md:flex">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`Slide ${index + 1}`}
              onClick={() => setCurrent(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                current === index ? "w-10 bg-white" : "w-6 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center border-b border-slate-200 bg-white px-4 py-6 text-left sm:px-6 sm:py-8 md:hidden">
        <div className="flex items-center gap-3">
          <Image
            className="h-10 w-auto object-contain sm:h-12"
            src="/images/NAGARA-DANA-RAKCA.png"
            alt="Nagara Dana Rakça"
            width={1072}
            height={1020}
            sizes="72px"
          />
          <Image
            className="h-10 w-auto object-contain sm:h-12"
            src="/images/kpknl-bogor.png"
            alt="KPKNL Bogor"
            width={354}
            height={335}
            sizes="72px"
          />
        </div>
        <div className="mt-4 flex flex-col items-start gap-2">
          <h1 className="text-3xl font-bold tracking-[0.1em] text-[#005FAC] sm:text-4xl">
            DOCLANG BOBA
          </h1>
          <p className="text-sm font-semibold tracking-[0.06em] text-slate-700 sm:text-base">
            Dokumen Pasca Lelang Bogor Bageur
          </p>
        </div>
        <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-600 sm:mt-7 sm:text-base text-center">
          Layanan pengajuan dokumen pasca lelang secara daring yang cepat,
          tertib, dan mudah diakses.
        </p>
        <Link
          href="#persyaratan"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#005FAC] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all active:scale-95 hover:bg-[#004A8C]"
        >
          Lihat Persyaratan
        </Link>
      </div>
    </section>
  );
}
