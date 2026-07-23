"use client";

import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  confirmClass,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{title}</p>
            <p className="text-xs text-slate-500">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} disabled={loading} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            Batal
          </button>
          <button onClick={onConfirm} disabled={loading} className={`rounded-lg px-4 py-2 text-xs font-bold text-white disabled:opacity-50 ${confirmClass}`}>
            {loading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
