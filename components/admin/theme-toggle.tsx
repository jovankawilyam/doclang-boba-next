"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text-primary)]"
      title={theme === "light" ? "Mode Gelap" : "Mode Terang"}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      {theme === "light" ? "Mode Gelap" : "Mode Terang"}
    </button>
  );
}
