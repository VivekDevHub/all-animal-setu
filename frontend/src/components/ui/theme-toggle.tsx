"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl border border-[var(--border)] bg-transparent ${className || ""}`} />
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer ${className || ""}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[var(--accent)] transition-transform rotate-0 scale-100" />
      ) : (
        <Moon className="w-4 h-4 text-[var(--secondary)] transition-transform rotate-0 scale-100" />
      )}
    </button>
  );
}
