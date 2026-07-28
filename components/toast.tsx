"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export type ToastData = {
  id: string;
  type: "success" | "error";
  message: string;
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback((type: ToastData["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}

export function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: ToastData[];
  dismiss: (id: string) => void;
}) {
  return (
    <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItemWrapper key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItemWrapper({ toast, dismiss }: { toast: ToastData; dismiss: (id: string) => void }) {
  const onDismiss = useCallback(() => dismiss(toast.id), [dismiss, toast.id]);
  return <ToastItem toast={toast} onDismiss={onDismiss} />;
}

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(onDismiss, 4000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [onDismiss]);

  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      } ${
        toast.type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0" />
      )}
      <span className="text-xs font-semibold">{toast.message}</span>
      <button onClick={onDismiss} className="ml-2 rounded p-0.5 hover:bg-black/5">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
