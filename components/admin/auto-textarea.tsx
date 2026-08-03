"use client";

import { useEffect, useRef, useState } from "react";

type AutoTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
};

export function AutoTextarea({ value, onChange, rows = 2, className = "" }: AutoTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onPointerDown={() => setIsResizing(true)}
      onPointerUp={() => setIsResizing(false)}
      onPointerLeave={() => setIsResizing(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.stopPropagation();
        }
      }}
      className={`w-full resize-y rounded-lg border px-3 py-2 text-sm leading-relaxed ${className} ${isResizing ? "cursor-ns-resize" : ""}`}
      style={{ borderColor: "var(--admin-border-input)", backgroundColor: "var(--admin-bg-card)", color: "var(--admin-text-body)", overflow: "hidden" }}
    />
  );
}
