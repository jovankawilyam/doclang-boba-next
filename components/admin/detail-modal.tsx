import { useEffect, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { StatusUpdate } from "./status-update";

type DetailData = Record<string, string>;

type Props = {
  id: string;
  onClose: () => void;
  onUpdated: () => void;
  toast: (type: "success" | "error", message: string) => void;
};

export function DetailModal({ id, onClose, onUpdated, toast }: Props) {
  const [data, setData] = useState<DetailData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/permohonan?id=${encodeURIComponent(id)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        if (!controller.signal.aborted && json.success) setData(json.data);
        else if (!controller.signal.aborted) toast("error", json.error || "Gagal memuat detail");
      })
      .catch((err) => {
        if (err.name !== "AbortError") toast("error", "Gagal memuat detail");
      });
    return () => controller.abort();
  }, [id, toast]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 p-4 pt-12"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#D8E0EC] px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-[#123C69]">Detail Permohonan</h2>
            <p className="text-xs text-slate-400">ID: {id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!data ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#C7D2E3] border-t-[#123C69]" />
            <span className="ml-3 text-sm text-slate-500">Memuat detail...</span>
          </div>
        ) : (
          <div className="px-6 py-4">
            <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-2">
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
                      <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        {key}
                      </div>
                      <div className="mt-0.5 text-sm">
                        {isUrl ? (
                          <a
                            href={val}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 break-all text-[#1E56A0] hover:text-[#123C69] hover:underline"
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            {val.length > 50 ? val.slice(0, 50) + "..." : val}
                          </a>
                        ) : (
                          <span className={val ? "text-slate-800" : "text-slate-300"}>{val || "-"}</span>
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
