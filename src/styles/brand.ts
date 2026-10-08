import { oklchToSrgb, parseColor } from "./color";
import { tokens } from "./tokens";

// Concrete colours for places that cannot read CSS variables: generated
// images (icons, Open Graph) and the browser theme-color. Derived from tokens.

function toHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b].map((value) => Math.round(value * 255).toString(16).padStart(2, "0")).join("")}`;
}

const note = (hue: number, stop: "top" | "mid" | "bottom" = "mid") =>
  toHex(oklchToSrgb(tokens.note.light[stop][0], tokens.note.light[stop][1], hue));

export const brand = {
  accent: toHex(oklchToSrgb(tokens.accent.light.l, tokens.accent.light.c, tokens.accent.hue)),
  accentDeep: toHex(oklchToSrgb(tokens.accent.light.l - 0.1, tokens.accent.light.c, tokens.accent.hue)),
  onAccent: tokens.accent.light.on,
  ink: tokens.color.light.ink,
  paper: tokens.color.light.paper,
  page: tokens.color.light.page,
  pageDark: tokens.color.dark.page,
  note,
  /** Same recipe as `.note`: 170deg top → mid → bottom of one hue. */
  noteGradient: (hue: number) => `linear-gradient(170deg, ${note(hue, "top")}, ${note(hue, "mid")} 55%, ${note(hue, "bottom")})`,
  inkHex: toHex(parseColor(tokens.color.light.ink)),
  inkMuted: "rgba(21, 20, 42, 0.62)",
  shadow: "0 22px 44px rgba(21, 20, 42, 0.22)",
  highlight: "rgba(255, 255, 255, 0.55)",
};

export const brandHues = {
  coral: tokens.note.paletteHues[0],
  sun: tokens.note.paletteHues[2],
  leaf: tokens.note.paletteHues[4],
  sea: tokens.note.paletteHues[6],
};
