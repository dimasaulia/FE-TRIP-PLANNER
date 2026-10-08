import { tokens } from "@/styles/tokens";

// Category colours live only in this browser: label → hue per trip.
// Unique per trip; 12 palette hues first, then golden-angle hues.

export type CategoryHues = Record<string, number>;

const GOLDEN_ANGLE = 137.5;

export function storageKey(tripId: string) {
  return `tp:category-colors:v1:${tripId}`;
}

export function normalizeCategory(label: string) {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

export function hashHue(label: string) {
  let hash = 0;
  for (const char of normalizeCategory(label)) hash = (hash * 33 + char.charCodeAt(0)) | 0;
  const palette = tokens.note.paletteHues;
  return palette[Math.abs(hash) % palette.length];
}

/** Picks a hue no other category of the trip uses yet. */
export function nextFreeHue(used: number[], random: () => number = Math.random) {
  const free = tokens.note.paletteHues.filter((hue) => !used.includes(hue));
  if (free.length) return free[Math.floor(random() * free.length)];

  let hue = used.length ? used[used.length - 1] : 0;
  for (let attempt = 0; attempt < 360; attempt += 1) {
    hue = Math.round((hue + GOLDEN_ANGLE) % 360);
    if (!used.includes(hue)) return hue;
  }
  return hue;
}

/** Assigns hues to labels seen for the first time; returns the same object if nothing changed. */
export function assignHues(current: CategoryHues, labels: string[], random?: () => number): CategoryHues {
  let next = current;
  for (const label of labels) {
    const key = normalizeCategory(label);
    if (!key || key in next) continue;
    if (next === current) next = { ...current };
    next[key] = nextFreeHue(Object.values(next), random);
  }
  return next;
}
