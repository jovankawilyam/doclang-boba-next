"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#D8E0EC] bg-white/96 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 md:px-8 md:py-4">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/images/image.png"
            alt="Logo"
            width={1920}
            height={483}
            className="h-10 w-auto object-contain sm:h-12 md:h-14"
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/#tracking"
            className="rounded-lg border-2 border-transparent py-2 text-base font-extrabold text-slate-600 transition-all duration-300 hover:border-[#005FAC] hover:text-[#005FAC]"
          >
            Lacak Dokumen
          </Link>
          <Link
            href="/form"
            className="rounded-lg border-2 border-transparent py-2 text-base font-extrabold text-slate-600 transition-all duration-300 hover:border-[#005FAC] hover:text-[#005FAC]"
          >
            Formulir
          </Link>
          <Link
            href="/persyaratan"
            className="rounded-lg border-2 border-transparent py-2 text-base font-extrabold text-slate-600 transition-all duration-300 hover:border-[#005FAC] hover:text-[#005FAC]"
          >
            Persyaratan
          </Link>
          <Link
            href="/standar-pelayanan"
            className="rounded-lg border-2 border-transparent py-2 text-base font-extrabold text-slate-600 transition-all duration-300 hover:border-[#005FAC] hover:text-[#005FAC]"
          >
            Standar Pelayanan
          </Link>
          <Link
            href="/tarif-layanan"
            className="rounded-lg border-2 border-transparent py-2 text-base font-extrabold text-slate-600 transition-all duration-300 hover:border-[#005FAC] hover:text-[#005FAC]"
          >
            Tarif Layanan
          </Link>
        </div>

        <button
          type="button"
          aria-label="Buka menu"
          className="rounded-lg border border-[#C7D2E3] px-3 py-2 text-xl text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </div>

      <div
        className={`overflow-hidden border-[#D8E0EC] bg-white px-4 shadow-sm transition-all duration-300 ease-in-out md:hidden ${
          open
            ? "max-h-[450px] scale-100 border-t py-4 opacity-100"
            : "pointer-events-none max-h-0 scale-95 border-t-0 py-0 opacity-0"
        }`}
      >
        <div className="space-y-2.5">
          <Link
            href="/#tracking"
            onClick={() => setOpen(false)}
            className="block rounded-xl bg-[#F4F7FB] px-4 py-3 text-sm font-bold text-slate-700"
          >
            Lacak Dokumen
          </Link>
          <Link
            href="/persyaratan"
            onClick={() => setOpen(false)}
            className="block rounded-xl bg-[#F4F7FB] px-4 py-3 text-sm font-bold text-slate-700"
          >
            Persyaratan
          </Link>
          <Link
            href="/form"
            onClick={() => setOpen(false)}
            className="block rounded-xl bg-[#F4F7FB] px-4 py-3 text-sm font-bold text-slate-700"
          >
            Formulir
          </Link>
          <Link
            href="/standar-pelayanan"
            onClick={() => setOpen(false)}
            className="block rounded-xl bg-[#F4F7FB] px-4 py-3 text-sm font-bold text-slate-700"
          >
            Standar Pelayanan
          </Link>
          <Link
            href="/tarif-layanan"
            onClick={() => setOpen(false)}
            className="block rounded-xl bg-[#F4F7FB] px-4 py-3 text-sm font-bold text-slate-700"
          >
            Tarif Layanan
          </Link>
        </div>
      </div>
    </nav>
  );
}
