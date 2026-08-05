"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronLeft } from "lucide-react";

import { BasicInfoSection } from "@/features/permohonan-form/components/basic-info-section";
import { DetailSection } from "@/features/permohonan-form/components/detail-section";
import { VerificationDialog } from "@/features/permohonan-form/components/verification-dialog";
import { usePermohonanForm } from "@/features/permohonan-form/use-permohonan-form";

function Stepper({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {[1, 2].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold shadow-sm transition md:h-11 md:w-11 md:text-base ${
              step >= s
                ? "border-navy bg-navy text-white"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            {s}
          </div>
          {s < 2 && (
            <div
              className={`mx-3 h-px w-16 transition md:mx-5 md:w-36 ${
                step > s ? "bg-navy" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function FormPage() {
  const form = usePermohonanForm();

  return (
    <div className="min-h-screen bg-white pb-20 text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 py-6 shadow-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-[auto_1fr_auto] items-center gap-3">
          <Link
            href="/"
            className="justify-self-start rounded-full p-2.5 transition-colors hover:bg-slate-100 sm:p-3"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600 sm:h-6 sm:w-6" />
          </Link>
          <span className="justify-self-center font-bold tracking-widest text-[#3388CC] uppercase">
            Formulir Permohonan
          </span>
          <div aria-hidden="true" />
        </div>
      </nav>
      <main className="mx-auto mt-5 max-w-4xl px-4 md:mt-10 md:px-6">
        <div className="mb-5 md:mb-10">
          <Stepper step={form.step} />
        </div>

        {form.successMessage && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-800 shadow-sm sm:px-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm">{form.successMessage}</p>
            </div>
          </div>
        )}

        {form.serverErrors.length > 0 && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700 shadow-sm sm:px-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <AlertCircle className="h-5 w-5" />
              <span>Periksa kembali data Anda:</span>
            </div>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {form.serverErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form
          onSubmit={form.handleSubmit(form.onSubmit)}
          className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-200 bg-slate-900 px-4 py-5 text-white sm:px-5 md:px-8 md:py-7">
            <p className="text-xs font-medium tracking-[0.2em] text-slate-300 uppercase">
              KPKNL Bogor
            </p>
            <h1 className="mt-2 text-lg font-semibold leading-snug sm:text-xl md:text-[1.55rem]">
              Dokumen Pasca Lelang Bogor Bageur
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Isi data, unggah berkas yang dibutuhkan, lalu cek ulang sebelum mengirim.
            </p>
          </div>

          <div className="px-4 py-5 sm:px-5 md:px-8 md:py-8">
            {form.step === 1 && (
              <BasicInfoSection
                fieldHelpers={form.fieldHelpers}
                fileInputHelpers={form.fileInputHelpers}
                goToSlideTwo={form.goToSlideTwo}
              />
            )}

            {form.step === 2 && (
              <DetailSection
                applicantRole={form.applicantRole}
                fieldHelpers={form.fieldHelpers}
                fileInputHelpers={form.fileInputHelpers}
                isSubmitting={form.isSubmitting}
                selectedRlObject={form.selectedRlObject}
                selectedService={form.selectedService}
                setStep={form.setStep}
              />
            )}
          </div>
        </form>
      </main>

      <VerificationDialog
        open={form.showVerification}
        values={form.pendingValues}
        uploadedFiles={form.uploadedFiles}
        onConfirm={form.confirmSubmit}
        onCancel={form.cancelSubmit}
        isSubmitting={form.isSubmitting}
      />
    </div>
  );
}
  
