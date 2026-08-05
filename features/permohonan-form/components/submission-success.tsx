"use client";

import { CheckCircle2, Check, Copy, RotateCcw } from "lucide-react";
import { useState } from "react";

import type { SubmissionReceipt } from "../types";

function cleanWaNumber(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("0")) return "62" + d.slice(1);
  if (d.startsWith("62")) return d;
  if (d.startsWith("8")) return "62" + d;
  return d;
}

function buildWaLink(wa: string, text: string): string {
  return `https://wa.me/${cleanWaNumber(wa)}?text=${encodeURIComponent(text)}`;
}

function buildNotificationText(receipt: SubmissionReceipt): string {
  return `Yth. Bapak/Ibu ${receipt.nama},

Dengan hormat, kami sampaikan bahwa permohonan Anda telah kami terima dengan nomor pengajuan ${receipt.id}.

Kami akan segera memproses permohonan Anda sesuai layanan yang dipilih. Status permohonan dapat dilacak melalui situs kami.

Atas perhatian dan kerja samanya, kami ucapkan terima kasih.

Hormat kami, KPKNL Bogor`;
}

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

  const waLink = buildWaLink(receipt.wa, buildNotificationText(receipt));

  return (
    <div className="mx-auto max-w-xl px-4 pt-6 md:pt-10">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white text-center shadow-sm">
        <div className="bg-slate-900 px-4 py-6 sm:px-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-9 w-9 text-emerald-500" />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-white sm:text-xl md:text-2xl">
            Permohonan Berhasil Dikirim
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Simpan nomor pengajuan Anda di bawah ini untuk melacak status
            permohonan.
          </p>
        </div>

        <div className="px-5 py-7 sm:px-8 md:py-9">
          <p className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">
            Nomor Pengajuan
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <code className="break-all rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xl font-bold text-navy sm:text-2xl">
              {receipt.id}
            </code>
            <button
              onClick={copyId}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Salin
                </>
              )}
            </button>
          </div>

          <div className="mt-7 space-y-3">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#02A54F] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#028840]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Kirim Notifikasi WhatsApp
            </a>
            <button
              onClick={onNewSubmission}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-navy px-6 py-3.5 text-sm font-semibold text-navy transition hover:bg-navy/5"
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
