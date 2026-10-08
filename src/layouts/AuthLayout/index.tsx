"use client";

import { usePreferences } from "@/modules/preferences";
import { noteStyle } from "@/shared/utils/hue";
import { tokens } from "@/styles/tokens";

type AuthLayoutProps = {
  children: React.ReactNode;
};

const samples = [
  { hue: tokens.note.paletteHues[0], key: "auth.sample.one", top: 0, rotate: -2 },
  { hue: tokens.note.paletteHues[4], key: "auth.sample.two", top: 84, rotate: 1.5 },
  { hue: tokens.note.paletteHues[7], key: "auth.sample.three", top: 168, rotate: -1 },
] as const;

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = usePreferences();
  return (
    <main className="min-h-screen bg-page">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-8 lg:grid-cols-[1fr_420px] lg:gap-16">
        <section className="hidden lg:block">
          <h1 className="max-w-lg text-5xl font-bold leading-[1.05] tracking-tight">{t("auth.headline")}</h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-ink-muted">{t("auth.subline")}</p>
          <div className="relative mt-10 h-64 max-w-sm">
            {samples.map((sample) => (
              <div
                className="note absolute inset-x-0 h-20 rounded-note px-4 py-3"
                key={sample.key}
                style={{ ...noteStyle(sample.hue), top: sample.top, transform: `rotate(${sample.rotate}deg)` }}
              >
                <p className="font-mono text-[10px] uppercase tracking-wider opacity-70">{t(`${sample.key}.tag`)}</p>
                <p className="mt-1 font-semibold">{t(`${sample.key}.title`)}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="flex items-center">{children}</section>
      </div>
    </main>
  );
}
