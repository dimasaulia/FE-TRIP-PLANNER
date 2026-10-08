"use client";

import { contrast, oklchToSrgb, parseColor } from "@/styles/color";
import { tokens, type ThemeName } from "@/styles/tokens";
import { noteStyle } from "@/shared/utils/hue";

// Rendered from tokens.ts, so it never drifts from the real values.
export function TokensV1() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">/dev/tokens</p>
        <h1 className="text-3xl font-bold">Design tokens</h1>
        <p className="mt-1 text-sm text-ink-muted">Source: src/styles/tokens.ts → npm run tokens → theme.css</p>
      </header>

      {(["light", "dark"] as ThemeName[]).map((theme) => (
        <section className="rounded-section bg-page p-6" data-theme={theme} key={theme}>
          <h2 className="mb-4 font-mono text-sm uppercase tracking-wider text-ink">{theme}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(tokens.color[theme]).map(([name, value]) => (
              <div className="overflow-hidden rounded-card border border-line bg-surface" key={name}>
                <div className="h-14" style={{ background: value }} />
                <div className="p-2 text-ink">
                  <p className="text-xs font-semibold">{name}</p>
                  <p className="font-mono text-[10px] text-ink-muted">{value}</p>
                </div>
              </div>
            ))}
            <div className="overflow-hidden rounded-card border border-line bg-surface">
              <div className="flex h-14 items-center justify-center bg-accent text-sm font-semibold text-on-accent">accent</div>
              <p className="p-2 font-mono text-[10px] text-ink-muted">
                oklch({tokens.accent[theme].l} {tokens.accent[theme].c} {tokens.accent.hue})
              </p>
            </div>
          </div>
          <h3 className="mb-3 mt-6 text-sm font-semibold text-ink">Notes · 170° gradient, top highlight, tinted shadow</h3>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {tokens.note.paletteHues.map((hue) => {
              const ratio = contrast(parseColor(tokens.color[theme].noteInk), oklchToSrgb(tokens.note[theme].bottom[0], tokens.note[theme].bottom[1], hue));
              return (
                <div className="note rounded-note p-3" key={hue} style={noteStyle(hue)}>
                  <p className="font-mono text-[10px] uppercase opacity-70">hue {hue}</p>
                  <p className="text-sm font-semibold">{ratio.toFixed(1)}:1</p>
                </div>
              );
            })}
            <div className="note note-neutral rounded-note p-3">
              <p className="font-mono text-[10px] uppercase opacity-70">neutral</p>
              <p className="text-sm font-semibold">—</p>
            </div>
          </div>
        </section>
      ))}

      <section>
        <h2 className="mb-3 text-lg font-bold">Radius</h2>
        <div className="flex flex-wrap gap-4">
          {Object.entries(tokens.radius).map(([name, value]) => (
            <div className="flex size-20 items-end bg-sunken-strong p-2 font-mono text-[10px]" key={name} style={{ borderRadius: Math.min(value, 40) }}>
              {name} {value}
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-bold">Type</h2>
        <p className="font-sans text-2xl">{tokens.font.sans} — Aa Bb 0123</p>
        <p className="font-mono text-lg">{tokens.font.mono} — 09:00–10:30</p>
      </section>
    </div>
  );
}
