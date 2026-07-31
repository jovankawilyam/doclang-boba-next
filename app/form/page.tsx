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
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition md:h-10 md:w-10 md:text-base ${
              step >= s
                ? "bg-navy text-white"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            {s}
          </div>
          {s < 2 && (
            <div
              className={`mx-2 h-0.5 w-16 transition md:mx-4 md:w-32 ${
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
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 py-6 shadow-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-3 items-center">
            <Link
            href="/"
            className="justify-self-start rounded-full p-3 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <span className="justify-self-center font-bold tracking-widest text-[#3388CC] uppercase">
            Formulir Permohonan
          </span>
        </div>
      </nav>
      <main className="mx-auto mt-6 max-w-4xl px-4 md:mt-10 md:px-6">
        <div className="mb-6 md:mb-10">
          <Stepper step={form.step} />
        </div>

        {form.successMessage && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-semibold">{form.successMessage}</p>
            </div>
          </div>
        )}

        {form.serverErrors.length > 0 && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-red-700">
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
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="border-b border-slate-200 bg-slate-900 px-5 py-5 text-white md:px-8 md:py-6">
            <p className="text-xs font-bold tracking-widest text-blue-200 uppercase">
              KPKNL Bogor
            </p>
            <h1 className="mt-1 text-lg font-bold md:text-xl">
              Dokumen Pasca Lelang Bogor Bageur
            </h1>
          </div>

          <div className="px-5 py-6 md:px-8 md:py-8">
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
  