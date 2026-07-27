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
    <>
      <section className="w-full overflow-hidden">
        <div className="relative w-full aspect-video max-h-[590px] overflow-hidden">
          <img
            src={images[current]}
            alt="slider"
            className="h-full w-full object-cover object-center transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <button
            type="button"
            onClick={prevSlide}
            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-2 text-white transition hover:bg-white/40"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-2 text-white transition hover:bg-white/40"
          >
            ›
          </button>
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

      <section className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-8 md:px-6 md:py-10">
        <div className="flex flex-col items-center gap-4 select-none">
          <img
            className="h-[80px] w-auto object-contain md:h-[100px]"
            src="/images/NAGARA-DANA-RAKCA.png"
            alt="Nagara Dana Rakça"
          />
          <h1 className="text-center text-4xl font-bold text-navy md:text-6xl">
            Selamat Datang di Doclang Boba
          </h1>
          <p className="max-w-2xl text-center text-base leading-relaxed text-slate-500 md:text-xl">
            Terima kasih telah mengunjungi. Silakan lihat persyaratan di bawah
            dan klik tombol formulir untuk mengajukan permohonan dokumen pasca
            lelang.
          </p>
        </div>
      </section>
    </>
  );
}