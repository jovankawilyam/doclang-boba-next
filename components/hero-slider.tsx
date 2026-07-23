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
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-10 select-none">
          <img
            className="h-[100px] w-auto object-contain md:h-[140px]"
            src="/images/NAGARA-DANA-RAKCA.png"
            alt="Nagara Dana Rakça"
          />
          <div className="flex flex-col items-center text-center md:items-center md:text-center font-sans tracking-tight">
            <h1 className="text-[45px] font-bold leading-[1] text-[#0f2d62] md:text-[70px] md:leading-[1.1]">
              doclang boba
            </h1>
            <h2 className="mt-2 text-[20px] font-bold leading-tight md:text-[38px] md:leading-none">
              <span className="text-[#f28e2b]">do</span>
              <span className="text-[#0f2d62]">kumen pas</span>
              <span className="text-[#f28e2b]">c</span>
              <span className="text-[#0f2d62]">a le</span>
              <span className="text-[#f28e2b]">l</span>
              <span className="text-[#f28e2b]">ang </span>
              <span className="text-[#f28e2b]">bo</span>
              <span className="text-[#0f2d62]">gor </span>
              <span className="text-[#f28e2b]">ba</span>
              <span className="text-[#0f2d62]">geur</span>
            </h2>
          </div>
        </div>
      </section>
    </>
  );
}
