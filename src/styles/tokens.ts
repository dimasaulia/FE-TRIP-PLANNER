// The single source of colours, fonts, radii and timeline geometry.
// Components only use the semantic names (bg-surface, text-ink-muted, bg-accent…);
// `npm run tokens` turns this file into `theme.css`.
// Neutrals and accent are provisional until the palette exploration is done.
export const tokens = {
  color: {
    light: {
      page: "#ECE8DF",
      paper: "#F3F0E8",
      surface: "#FBFAF6",
      sunken: "#EFEBE1",
      sunkenStrong: "#E4DFD2",
      ink: "#15142A",
      inkMuted: "rgb(21 20 42 / .55)",
      line: "rgb(21 20 42 / .07)",
      lineStrong: "rgb(21 20 42 / .16)",
      online: "oklch(0.72 0.17 150)",
      danger: "oklch(0.55 0.2 25)",
      noteInk: "#15142A",
    },
    // proposal, pending design approval
    dark: {
      page: "#0C0B16",
      paper: "#121120",
      surface: "#1A1930",
      sunken: "#232240",
      sunkenStrong: "#2C2B4F",
      ink: "#ECEAF7",
      inkMuted: "rgb(236 234 247 / .6)",
      line: "rgb(236 234 247 / .1)",
      lineStrong: "rgb(236 234 247 / .2)",
      online: "oklch(0.72 0.17 150)",
      danger: "oklch(0.7 0.17 25)",
      noteInk: "#15142A",
    },
  },
  // One accent for the selected day, primary action, focus and drop target,
  // derived from one hue: change `hue` to recolour every accent.
  accent: {
    hue: 265,
    light: { l: 0.45, c: 0.22, on: "#FFFFFF" },
    dark: { l: 0.72, c: 0.15, on: "#14132B" },
  },
  // Sticky notes: every category shares lightness and chroma, only the hue changes.
  note: {
    light: { top: [0.88, 0.11], mid: [0.79, 0.15], bottom: [0.7, 0.16] },
    dark: { top: [0.8, 0.1], mid: [0.72, 0.14], bottom: [0.64, 0.15] },
    paletteHues: [20, 50, 80, 110, 140, 170, 200, 230, 260, 290, 320, 350],
    neutral: { hue: 95, chroma: 0.02 },
  },
  font: { sans: "Bricolage Grotesque", mono: "JetBrains Mono" },
  radius: { input: 12, note: 16, chip: 18, card: 22, panel: 26, section: 32, pill: 999 },
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32 },
  timeline: { scrollToHour: 6, endHour: 24, hourHeight: 66, snapMinutes: 15, minBlockMinutes: 15, gutterWidth: 60 },
  motion: { fast: 120, base: 200 },
} as const;

export type ThemeName = "light" | "dark";
