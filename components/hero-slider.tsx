"use client";

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
      <div className="relative w-full min-h-[460px] overflow-hidden md:aspect-video md:min-h-0 md:max-h-[590px]">
        <img
          src={images[current]}
          alt="slider"
          className="h-full w-full object-cover object-top transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 md:to-transparent" />
        <button
          type="button"
          onClick={prevSlide}
          className="absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-white backdrop-blur-sm transition hover:bg-white/40"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={nextSlide}
          className="absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-white backdrop-blur-sm transition hover:bg-white/40"
        >
          ›
        </button>
        <div className="absolute inset-0 z-10 flex select-none flex-col items-start justify-center px-6 pt-8 md:px-16 md:pt-16">
          <div className="flex items-center gap-4">
            <img
            className="h-[80px] w-auto animate-fade-slide-down object-contain drop-shadow-lg md:h-[100px]"
            src="/images/NAGARA-DANA-RAKCA.png"
            alt="Nagara Dana Rakça"
            />
            <img
            className="h-[80px] w-auto animate-fade-slide-down object-contain drop-shadow-lg md:h-[100px]"
            src="/images/kpknl-bogor.png"
            alt=""
            />
          </div>
          <h1
            className="mt-3 animate-fade-slide-up max-w-2xl text-2xl font-bold text-white opacity-0 md:mt-4 md:text-6xl"
            style={{ textShadow: "0 4px 12px rgba(0,0,0,0.6)", animationDelay: "200ms" }}
          >
            Selamat Datang di Doclang Boba
          </h1>
          <p
            className="mt-1 animate-fade-slide-up max-w-xl text-sm leading-relaxed text-white/90 opacity-0 md:mt-2 md:text-xl"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)", animationDelay: "400ms" }}
          >
            Ajukan permohonan dokumen pasca lelang secara online. <br />
            Cek status dan ambil dokumen di KPKNL Bogor.
          </p>
          <a
  href="#persyaratan"
  className="mt-6 inline-flex animate-fade-slide-up items-center gap-2 rounded-xl border-2 border-white px-6 py-3 text-sm font-semibold text-white opacity-0 transition-all duration-300 hover:bg-white hover:text-[#123C69] hover:shadow-lg md:text-base"
  style={{ animationDelay: "600ms" }}
>
  Lihat Persyaratan
</a>
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            aria-label={`Slide ${index + 1}`}
            onClick={() => setCurrent(index)}
            className={`h-3 w-3 rounded-full transition ${
              current === index ? "bg-blue-700" : "bg-slate-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
