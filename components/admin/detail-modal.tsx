"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { StatusUpdate } from "./status-update";
import { StatusBadge } from "./status-badge";
import { getAuthHeaders } from "@/lib/admin-fetch";

type DetailData = Record<string, string>;

type Props = {
  id: string;
  onClose: () => void;
  onUpdated: () => void;
  toast: (type: "success" | "error", message: string) => void;
};

export function DetailModal({ id, onClose, onUpdated, toast }: Props) {
  const [data, setData] = useState<DetailData | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    fetch(`/api/admin/permohonan?id=${encodeURIComponent(id)}`, { signal: controller.signal, headers: getAuthHeaders() })
    .then((r) => r.json())

      .then((json) => {
        if (!controller.signal.aborted && json.success) setData(json.data);
        else if (!controller.signal.aborted) toast("error", json.error || "Gagal memuat detail");
      })
      .catch((err) => {
        if (err.name !== "AbortError") toast("error", "Gagal memuat detail");
      });
    return () => {
      controller.abort();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [id, toast, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-12"
      style={{ backgroundColor: "var(--admin-overlay)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-xl shadow-2xl"
        style={{ backgroundColor: "var(--admin-bg-card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--admin-border)" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--admin-text-primary)" }}>Detail Permohonan</h2>
            <p className="text-xs" style={{ color: "var(--admin-text-secondary)" }}>ID: {id}</p>
          </div>
          <div className="ml-auto mr-3">
            <StatusBadge status={data?.["Status Proses"] ?? ""} />
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 transition-colors"
            style={{ color: "var(--admin-text-secondary)" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--admin-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!data ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2" style={{ borderColor: "var(--admin-border-input)", borderTopColor: "var(--admin-text-primary)" }} />
            <span className="ml-3 text-sm" style={{ color: "var(--admin-text-secondary)" }}>Memuat detail...</span>
          </div>
        ) : (
          <div className="px-6 py-4">
            {previewUrl ? (
              <div className="mb-5 overflow-hidden rounded-xl border" style={{ borderColor: "var(--admin-border)" }}>
                <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--admin-border)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--admin-text-primary)" }}>Preview Dokumen</p>
                  <button onClick={() => setPreviewUrl("")} className="rounded-md px-3 py-1 text-xs font-semibold" style={{ color: "var(--admin-text-secondary)" }}>Tutup Preview</button>
                </div>
                <iframe src={previewUrl} className="h-[70vh] w-full" />
              </div>
            ) : null}
            <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3 lg:grid-cols-4">
              {Object.entries(data)
                .filter(
                  ([k, v]) =>
                    v &&
                    !k.startsWith("Merged") &&
                    !k.startsWith("Link") &&
                    !k.startsWith("Document") &&
                    !k.startsWith("bantu_") &&
                    k !== "jarak" &&
                    k !== "_" &&
                    !k.startsWith("Verif") &&
                    !k.startsWith("auto_")
                )
                .map(([key, val]) => {
                  const isUrl =
                    typeof val === "string" && (val.startsWith("http://") || val.startsWith("https://"));
                  return (
                    <div key={key} className={key.includes("Keterangan") || key.includes("Alamat") ? "col-span-2" : ""}>
                      <div className="text-[10px] font-bold tracking-wider uppercase" style={{ color: "var(--admin-text-secondary)" }}>
                        {key}
                      </div>
                      <div className="mt-0.5 text-sm">
                        {isUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewUrl(val)}
                            className="inline-flex items-center gap-1 break-all hover:underline"
                            style={{ color: "var(--admin-text-primary)" }}
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            {val.length > 50 ? val.slice(0, 50) + "..." : val}
                          </button>
                        ) : (
                          <span style={{ color: val ? "var(--admin-text-body)" : "var(--admin-text-secondary)" }}>{val || "-"}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <StatusUpdate id={id} data={data} onUpdated={onUpdated} toast={toast} />
          </div>
        )}
      </div>
    </div>
  );
}
