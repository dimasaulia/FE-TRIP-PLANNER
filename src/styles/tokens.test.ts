import { describe, expect, it } from "vitest";
import { contrast, oklchToSrgb, parseColor } from "./color";
import { tokens, type ThemeName } from "./tokens";

const themes: ThemeName[] = ["light", "dark"];

describe("token contrast", () => {
  it.each(themes)("text on surfaces passes 4.5:1 in %s", (theme) => {
    const colors = tokens.color[theme];
    for (const surface of [colors.page, colors.paper, colors.surface, colors.sunken]) {
      expect(contrast(parseColor(colors.ink), parseColor(surface))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(themes)("ink on every note stop and hue passes 4.5:1 in %s", (theme) => {
    const ink = parseColor(tokens.color[theme].noteInk);
    for (const hue of tokens.note.paletteHues) {
      for (const [l, c] of Object.values(tokens.note[theme])) {
        expect(contrast(ink, oklchToSrgb(l, c, hue))).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it.each(themes)("text on the accent passes 4.5:1 in %s", (theme) => {
    const accent = tokens.accent[theme];
    expect(contrast(parseColor(accent.on), oklchToSrgb(accent.l, accent.c, tokens.accent.hue))).toBeGreaterThanOrEqual(4.5);
  });
});
