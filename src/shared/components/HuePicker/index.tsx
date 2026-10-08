"use client";

import { cn } from "@/shared/utils/cn";
import { noteStyle } from "@/shared/utils/hue";
import { tokens } from "@/styles/tokens";

type HuePickerProps = {
  value: number | null;
  onChange: (hue: number | null) => void;
  disabled?: boolean;
  /** Label of the neutral (no colour) option. */
  neutralLabel: string;
};

/** The note palette plus a neutral swatch. */
export function HuePicker({ value, onChange, disabled, neutralLabel }: HuePickerProps) {
  const ring = "ring-2 ring-ink ring-offset-2 ring-offset-surface";
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup">
      <button
        aria-checked={value === null}
        aria-label={neutralLabel}
        className={cn("note-dot note-neutral size-6 rounded-pill", value === null && ring)}
        disabled={disabled}
        onClick={() => onChange(null)}
        role="radio"
        title={neutralLabel}
        type="button"
      />
      {tokens.note.paletteHues.map((hue) => (
        <button
          aria-checked={value === hue}
          aria-label={String(hue)}
          className={cn("note-dot size-6 rounded-pill", value === hue && ring)}
          disabled={disabled}
          key={hue}
          onClick={() => onChange(hue)}
          role="radio"
          style={noteStyle(hue)}
          type="button"
        />
      ))}
    </div>
  );
}
