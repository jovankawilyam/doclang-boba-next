"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [showNav, setShowNav] = useState(true);
  const [open, setOpen] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowNav(
        !(currentScrollY > lastScrollYRef.current && currentScrollY > 100),
      );
      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b border-[#D8E0EC] bg-white/95 shadow-sm backdrop-blur transition-transform duration-300 ${
        showNav ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="cursor-pointer">
          <img
            src="/images/image.png"
            alt="Logo"
            className="h-14 w-auto object-contain"
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/#tracking"
            className="text-base font-extrabold text-slate-600 border-2 border-transparent hover:border-[#005FAC] hover:text-[#005FAC] rounded-lg py-2 transition-all duration-300"
          >
            Lacak Dokumen
          </Link>
          <a
            href="/form"
            className="text-base font-extrabold text-slate-600 border-2 border-transparent hover:border-[#005FAC] hover:text-[#005FAC] rounded-lg py-2 transition-all duration-300"
          >
            Formulir
          </a>
          <a
            href="/persyaratan"
            className="text-base font-extrabold text-slate-600 border-2 border-transparent hover:border-[#005FAC] hover:text-[#005FAC] rounded-lg py-2 transition-all duration-300"
          >
            Persyaratan
          </a>
          <Link
            href="/standar-pelayanan"
            className="text-base font-extrabold text-slate-600 border-2 border-transparent hover:border-[#005FAC] hover:text-[#005FAC] rounded-lg py-2 transition-all duration-300"
          >
            Standar Pelayanan
          </Link>
          <Link
            href="/tarif-layanan"
            className="text-base font-extrabold text-slate-600 border-2 border-transparent hover:border-[#005FAC] hover:text-[#005FAC] rounded-lg py-2 transition-all duration-300"
          >
            Tarif Layanan
          </Link>

        </div>

        <button
          type="button"
          aria-label="Buka menu"
          className="rounded-lg border border-[#C7D2E3] px-3 py-2 text-2xl text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </div>

      <div
        className={`overflow-hidden border-[#D8E0EC] bg-white px-6 shadow-sm transition-all duration-300 ease-in-out md:hidden ${
          open
            ? "max-h-[450px] scale-100 border-t py-5 opacity-100"
            : "pointer-events-none max-h-0 scale-95 border-t-0 py-0 opacity-0"
        }`}
      >
        <div className="space-y-3">
          <Link
            href="/#tracking"
            onClick={() => setOpen(false)}
            className="block rounded-xl bg-[#F4F7FB] px-4 py-3 text-base font-bold text-slate-700"
          >
            Lacak Dokumen
          </Link>
          <a
            href="/persyaratan"
            onClick={() => setOpen(false)}
            className="block rounded-xl bg-[#F4F7FB] px-4 py-3 text-base font-bold text-slate-700"
          >
            Persyaratan
          </a>
          <a
            href="/form"
            onClick={() => setOpen(false)}
            className="block rounded-xl bg-[#F4F7FB] px-4 py-3 text-base font-bold text-slate-700"
          >
            Formulir
          </a>
          <Link
            href="/standar-pelayanan"
            onClick={() => setOpen(false)}
            className="block rounded-xl bg-[#F4F7FB] px-4 py-3 text-base font-bold text-slate-700"
          >
            Standar Pelayanan
          </Link>
          <Link
            href="/tarif-layanan"
            onClick={() => setOpen(false)}
            className="block rounded-xl bg-[#F4F7FB] px-4 py-3 text-base font-bold text-slate-700"
          >
            Tarif Layanan
          </Link>

        </div>
      </div>
    </nav>
  );
}
