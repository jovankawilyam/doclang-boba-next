"use client";

import { CheckCircle2, Check, Copy, RotateCcw, FileDown } from "lucide-react";
import { useState } from "react";

import type { SubmissionReceipt } from "../types";

export function SubmissionSuccess({
  receipt,
  onNewSubmission,
}: {
  receipt: SubmissionReceipt;
  onNewSubmission: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyId = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(receipt.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const pdfUrl = `/api/bukti/pdf?id=${encodeURIComponent(receipt.id)}`;

  return (
    <div className="mx-auto max-w-xl px-4 pt-6 md:pt-10">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
        <div className="bg-[#123C69] px-5 py-6 sm:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-white sm:text-2xl">
            Permohonan Diterima
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-sky-100">
            Terima kasih, Bapak/Ibu {receipt.nama}. Permohonan Anda sudah kami
            terima dan akan segera diproses. Simpan nomor tiket di bawah untuk
            melacak status dokumen Anda.
          </p>
        </div>

        <div className="px-5 py-7 sm:px-8 md:py-8">
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-5">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-slate-500 uppercase">
              Nomor Tiket
            </p>
            <p className="mt-2 break-all font-mono text-2xl font-bold tracking-wide text-[#123C69] sm:text-3xl">
              {receipt.id}
            </p>
            <button
              onClick={copyId}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Salin Nomor Tiket
                </>
              )}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm">
            <span className="text-slate-500">Nama Pemohon</span>
            <span className="max-w-[60%] truncate font-medium text-slate-900">
              {receipt.nama}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            <a
              href={pdfUrl}
              download
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#123C69] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B2B4F]"
            >
              <FileDown className="h-4 w-4" />
              Download PDF Tanda Terima
            </a>
            <button
              onClick={onNewSubmission}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Buat Permohonan Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
