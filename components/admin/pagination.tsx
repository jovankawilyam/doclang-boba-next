type Props = {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
};

export function Pagination({ page, totalPages, total, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    return start + i;
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#D8E0EC] bg-white px-4 py-3">
      <p className="text-xs text-slate-500">
        {total} data &middot; Halaman {page} dari {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-md border border-[#C7D2E3] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-[#F4F7FB] disabled:cursor-not-allowed disabled:opacity-40"
        >
          &larr; Sebelumnya
        </button>
        {pages.map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
              num === page
                ? "bg-[#1E56A0] text-white"
                : "border border-[#C7D2E3] text-slate-600 hover:bg-[#F4F7FB]"
            }`}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="rounded-md border border-[#C7D2E3] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-[#F4F7FB] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Selanjutnya &rarr;
        </button>
      </div>
    </div>
  );
}
