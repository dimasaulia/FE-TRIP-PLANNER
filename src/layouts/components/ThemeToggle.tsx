"use client";

import { usePreferences } from "@/modules/preferences";
import { cn } from "@/shared/utils/cn";

/** Light/dark switch; flipping it stores an explicit choice over the system one. */
export function ThemeToggle() {
  const { t, resolvedTheme, setTheme } = usePreferences();
  const dark = resolvedTheme === "dark";

  return (
    <button
      aria-checked={dark}
      aria-label={t("user.theme.toggle")}
      className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-pill border border-line-strong bg-sunken px-0.5 transition-colors"
      onClick={() => setTheme(dark ? "light" : "dark")}
      role="switch"
      title={dark ? t("user.theme.dark") : t("user.theme.light")}
      type="button"
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex size-6 items-center justify-center rounded-pill bg-surface text-xs shadow transition-transform duration-(--motion-base)",
          dark ? "translate-x-6" : "translate-x-0",
        )}
      >
        {dark ? "☾" : "☀"}
      </span>
    </button>
  );
}
