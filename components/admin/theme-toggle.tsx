"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--admin-hover)]"
      style={{ color: "var(--admin-text-body)" }}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="flex-1 text-left">{isDark ? "Mode Gelap" : "Mode Terang"}</span>
      <span
        className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${isDark ? "bg-[var(--admin-text-primary)]" : "bg-slate-300"}`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isDark ? "translate-x-[18px]" : "translate-x-0.5"} mt-0.5`}
        />
      </span>
    </button>
  );
}
