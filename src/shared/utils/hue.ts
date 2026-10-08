import { tokens } from "@/styles/tokens";

/** Stable hue for an id (user avatars), taken from the note palette. */
export function hueForId(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) | 0;
  }
  const palette = tokens.note.paletteHues;
  return palette[Math.abs(hash) % palette.length];
}

export function noteStyle(hue: number | null): React.CSSProperties {
  return hue === null ? {} : ({ "--note-hue": hue } as React.CSSProperties);
}
