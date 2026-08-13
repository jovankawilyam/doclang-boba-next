"use client";

import { CheckCircle2, RotateCcw, Upload } from "lucide-react";
import type { ChangeEvent, ChangeEventHandler, HTMLAttributes } from "react";
import type { FieldPath } from "react-hook-form";

import {
  errorClassName,
  FILE_ACCEPT_ATTRIBUTE,
  helperClassName,
  inputClassName,
  labelClassName,
} from "../constants";
import type {
  DoclangFormValues,
  FieldHelpers,
  FileInputHelpers,
} from "../types";
import { formatUploadedFileSize, fieldErrorMessage } from "../use-permohonan-form";

export const TextField = ({
  form,
  name,
  label,
  type = "text",
  placeholder,
  note,
  inputMode,
  pattern,
  onChange,
}: {
  form: FieldHelpers;
  name: FieldPath<DoclangFormValues>;
  label: string;
  type?: string;
  placeholder?: string;
  note?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) => {
  const { onChange: registerOnChange } = form.register(name);
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.(e);
    registerOnChange(e);
  };
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className={labelClassName}>
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        inputMode={inputMode}
        pattern={pattern}
        className={inputClassName}
        {...form.register(name)}
        onChange={handleChange}
      />
      {note && <p className={helperClassName}>{note}</p>}
      {form.renderError(name)}
    </div>
  );
};

export const TextAreaField = ({
  form,
  name,
  label,
}: {
  form: FieldHelpers;
  name: FieldPath<DoclangFormValues>;
  label: string;
}) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className={labelClassName}>
      {label} <span className="text-red-500">*</span>
    </label>
    <textarea
      id={name}
      rows={3}
      className={inputClassName}
      {...form.register(name)}
    />
    {form.renderError(name)}
  </div>
);

export const UploadZone = ({
  form,
  name,
  label,
  note,
}: {
  form: FileInputHelpers;
  name: FieldPath<DoclangFormValues>;
  label: string;
  note: string;
}) => {
  const { errors, register, uploadedFiles, uploadFile } = form;
  const message = fieldErrorMessage(errors, name);
  const selectedFile = uploadedFiles[name];
  const fileRegistration = register(name);

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    await fileRegistration.onChange(event);

    const file = event.target.files?.item(0) ?? null;
    await uploadFile(name, file);
  };

  const handleRetry = (): void => {
    const input = document.getElementById(String(name)) as HTMLInputElement | null;
    input?.click();
  };

  return (
    <div className="space-y-1.5">
      <span className={labelClassName}>
        {label} <span className="text-red-500">*</span>
      </span>
      <label
        className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 px-5 py-4 transition ${
          selectedFile?.uploading
            ? "border-amber-300 bg-amber-50 hover:border-amber-400"
            : selectedFile?.error
              ? "border-red-300 bg-red-50 hover:border-red-400"
              : selectedFile
                ? "border-emerald-300 bg-emerald-50 hover:border-emerald-400"
                : "border-slate-200 bg-white hover:border-navy/30 hover:bg-navy/[0.02]"
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            selectedFile?.uploading
              ? "bg-amber-100 text-amber-700"
              : selectedFile
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
          }`}
        >
          {selectedFile?.uploading ? (
            <Upload className="h-5 w-5" />
          ) : selectedFile ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1 text-left">
          {selectedFile ? (
            <>
              <p className={`text-sm font-medium ${selectedFile.uploading ? "text-amber-800" : selectedFile.error ? "text-red-800" : "text-emerald-800"}`}>
                {selectedFile.name}
              </p>
              <p className={`mt-0.5 text-xs ${selectedFile.uploading ? "text-amber-600" : selectedFile.error ? "text-red-600" : "text-emerald-600"}`}>
                {selectedFile.uploading ? "Sedang mengunggah..." : selectedFile.error ?? formatUploadedFileSize(selectedFile.size)}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-700">
                Klik untuk unggah dokumen
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{note}</p>
            </>
          )}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {selectedFile?.error && (
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Upload ulang
            </button>
          )}
        </div>
        <input
          id={String(name)}
          type="file"
          accept={FILE_ACCEPT_ATTRIBUTE}
          className="hidden"
          {...fileRegistration}
          onChange={handleFileChange}
        />
      </label>
      {selectedFile && (
        <p className={`text-xs ${selectedFile.uploading ? "text-amber-600" : selectedFile.error ? "text-red-600" : "text-emerald-600"}`}>
          <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
          {selectedFile.uploading ? "Sedang mengunggah" : selectedFile.error ?? "Dokumen siap dikirim"}
        </p>
      )}
      {message && <p className={errorClassName}>{message}</p>}
    </div>
  );
};
