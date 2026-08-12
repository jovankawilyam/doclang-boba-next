"use client";

import Image from "next/image";
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
            loading={index === 0 ? undefined : "lazy"}
          />
        ))}
        <div className="absolute inset-0 hidden md:block bg-gradient-to-b from-black/80 via-black/45 to-black/80 " />
        <button
          type="button"
          onClick={prevSlide}
          className="absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-white transition hover:bg-white/40"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={nextSlide}
          className="absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-white transition hover:bg-white/40"
        >
          ›
        </button>
        <div className="absolute inset-0 z-10 hidden select-none flex-col items-center justify-start text-center md:flex md:px-16 md:pt-12 lg:pt-16">
          <div className="flex items-center justify-center gap-4">
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
          <p
            className="mt-8 animate-fade-slide-up text-2xl font-bold tracking-[0.2em] text-white uppercase opacity-0 md:mt-6 md:text-6xl"
            style={{
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              animationDelay: "200ms",
            }}
          >
            Selamat Datang
          </p>
          <p
            className="mt-3 animate-fade-slide-up text-2xl font-bold tracking-[0.15em] text-white opacity-0 md:mt-3 md:text-4xl"
            style={{
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              animationDelay: "300ms",
            }}
          >
            DI SITUS RESMI
          </p>
          <h1
            className="mt-3 animate-fade-slide-up text-4xl font-bold tracking-[0.15em] text-white opacity-0 md:mt-3 md:text-6xl"
            style={{
              textShadow: "0 4px 12px rgba(0,0,0,0.8)",
              animationDelay: "300ms",
            }}
          >
            DOCLANG BOBA
          </h1>

          <p
            className="mt-1 animate-fade-slide-up text-base font-semibold tracking-[0.15em] text-white/95 opacity-0 md:mt-2 md:text-2xl"
            style={{
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              animationDelay: "400ms",
            }}
          >
            Dokumen Pasca Lelang Bogor Bageur
          </p>

          <a
            href="#persyaratan"
            className="mt-12 inline-flex animate-fade-slide-up items-center gap-2 rounded-xl border-2 border-white px-6 py-3 text-sm font-semibold text-white opacity-0 transition-all duration-300 hover:bg-white hover:text-[#123C69] hover:shadow-lg md:text-base"
            style={{ animationDelay: "700ms" }}
          >
            Lihat Persyaratan
          </a>
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
      <div className="flex flex-col items-center border-b border-slate-200 bg-white px-4 py-6 text-center sm:px-6 sm:py-8 md:hidden">
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
        <div className="flex flex-col items-center">
          <p className="mt-4 text-3xl font-bold tracking-[0.2em] text-slate-600 uppercase sm:text-4xl">
            Selamat Datang
          </p>
          <p className="mt-3 text-xl font-bold tracking-[0.15em] text-slate-500 sm:text-2xl">
            DI SITUS RESMI
          </p>
          <h1 className="mt-2 text-xl font-bold tracking-[0.15em] text-[#005FAC] sm:text-2xl">
            DOCLANG BOBA
          </h1>
          <p className="mt-2 text-sm font-semibold tracking-[0.15em] text-slate-700 sm:text-base">
            Dokumen Pasca Lelang Bogor Bageur
          </p>
        </div>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600 sm:text-base">
          Ajukan permohonan dokumen pasca lelang secara online.
          <br />
          Cek status dan ambil dokumen di KPKNL Bogor.
        </p>
        <a
          href="#persyaratan"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#005FAC] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all active:scale-95 hover:bg-[#004A8C]"
        >
          Lihat Persyaratan
        </a>
      </div>
    </section>
  );
}
