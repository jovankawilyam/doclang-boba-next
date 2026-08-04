"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-[var(--admin-hover)]"
      style={{
        color: "var(--admin-text-body)",
        borderColor: "var(--admin-border)",
        backgroundColor: "var(--admin-bg-card)",
      }}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
      aria-label={isDark ? "Mode Terang" : "Mode Gelap"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
