import { useState, useCallback } from "react";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
};

const btn =
  "rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";

function btnStyle() {
  return { borderColor: "var(--admin-border-input)", color: "var(--admin-text-body)" } as const;
}

function btnHover(e: React.MouseEvent<HTMLButtonElement>) {
  if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "var(--admin-hover)";
}
function btnLeave(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.backgroundColor = "transparent";
}

export function Pagination({ page, totalPages, total, onPageChange }: Props) {
  const [jump, setJump] = useState("");
  const [focused, setFocused] = useState(false);

  const handleJump = useCallback(() => {
    const num = parseInt(jump, 10);
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      onPageChange(num);
      setJump("");
    }
  }, [jump, totalPages, onPageChange]);

  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const range = 2;
  let start = Math.max(1, page - range);
  let end = Math.min(totalPages, page + range);
  if (page - range < 1) end = Math.min(totalPages, end + (range - page + 1));
  if (page + range > totalPages) start = Math.max(1, start - (page + range - totalPages));
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-t px-4 py-3"
      style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}
    >
      <p className="text-xs" style={{ color: "var(--admin-text-secondary)" }}>
        {total} data &middot; Halaman {page} dari {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(1)} disabled={page <= 1} className={btn} style={btnStyle()} onMouseEnter={btnHover} onMouseLeave={btnLeave}>
          &laquo;
        </button>
        <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} className={btn} style={btnStyle()} onMouseEnter={btnHover} onMouseLeave={btnLeave}>
          &lsaquo;
        </button>
        {pages.map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className="rounded-md px-3 py-1.5 text-xs font-bold transition-colors"
            style={{
              backgroundColor: num === page ? "var(--admin-text-primary)" : "transparent",
              color: num === page ? "#fff" : "var(--admin-text-body)",
              border: num === page ? "none" : "1px solid var(--admin-border-input)",
            }}
            onMouseEnter={(e) => { if (num !== page) e.currentTarget.style.backgroundColor = "var(--admin-hover)"; }}
            onMouseLeave={(e) => { if (num !== page) e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            {num}
          </button>
        ))}
        <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className={btn} style={btnStyle()} onMouseEnter={btnHover} onMouseLeave={btnLeave}>
          &rsaquo;
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={page >= totalPages} className={btn} style={btnStyle()} onMouseEnter={btnHover} onMouseLeave={btnLeave}>
          &raquo;
        </button>

        <span className="ml-2 mr-1 text-xs" style={{ color: "var(--admin-text-secondary)" }}>Hal.</span>
        <div className="flex overflow-hidden rounded-md border" style={{ borderColor: focused ? "#3b82f6" : "var(--admin-border-input)" }}>
          <input
            type="text"
            value={jump}
            onChange={(e) => setJump(e.target.value.replace(/\D/, ""))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => { if (e.key === "Enter") handleJump(); }}
            className="w-12 border-none py-1.5 text-center text-xs font-semibold outline-none"
            style={{ color: "var(--admin-text-body)", backgroundColor: "var(--admin-bg-card)" }}
            placeholder="..."
          />
          <button
            onClick={handleJump}
            className="border-l px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:opacity-80"
            style={{ backgroundColor: "var(--admin-text-primary)", borderColor: "var(--admin-border-input)" }}
          >
            Buka
          </button>
        </div>
      </div>
    </div>
  );
}
