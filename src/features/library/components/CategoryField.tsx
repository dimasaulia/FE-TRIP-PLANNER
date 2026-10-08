"use client";

import { useId, useState } from "react";
import { normalizeCategory } from "@/features/library/services/category-color.service";
import { usePreferences } from "@/modules/preferences";
import { Popover } from "@/shared/components/Popover";
import { cn } from "@/shared/utils/cn";
import { noteStyle } from "@/shared/utils/hue";
import { tokens } from "@/styles/tokens";

type CategoryFieldProps = {
  value: string;
  suggestions: string[];
  disabled?: boolean;
  hueOf: (label: string | null) => number | null;
  usedHues: Array<[string, number]>;
  onCommit: (value: string) => void;
  onHueChange: (label: string, hue: number) => void;
};

/** Free text with suggestions from the trip; the colour is chosen or random, per browser. */
export function CategoryField({ value, suggestions, disabled, hueOf, usedHues, onCommit, onHueChange }: CategoryFieldProps) {
  const { t } = usePreferences();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const [lastValue, setLastValue] = useState(value);
  if (!focused && value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }
  // Colour follows the saved label; a half-typed one never claims a hue.
  const hue = hueOf(value || null);
  const key = normalizeCategory(value);

  return (
    <div className="flex items-center gap-2">
      <Popover
        onOpenChange={setOpen}
        open={open}
        trigger={
          <button
            aria-label={t("library.categoryColor")}
            className="note-dot size-5 shrink-0 rounded-pill ring-2 ring-surface disabled:opacity-40"
            disabled={disabled || !value.trim()}
            style={noteStyle(hue)}
            type="button"
          />
        }
        width={232}
      >
        <p className="mb-2 text-xs font-semibold text-ink-muted">{t("library.categoryColor")}</p>
        <div className="grid grid-cols-6 gap-2">
          {tokens.note.paletteHues.map((option) => {
            const takenBy = usedHues.find(([label, used]) => used === option && label !== key)?.[0];
            return (
              <button
                aria-label={takenBy ? t("library.hueTaken", { label: takenBy }) : String(option)}
                className={cn(
                  "note-dot size-7 rounded-pill",
                  option === hue && "ring-2 ring-ink ring-offset-2 ring-offset-surface",
                  takenBy && "cursor-not-allowed opacity-25",
                )}
                disabled={Boolean(takenBy)}
                key={option}
                onClick={() => {
                  onHueChange(value, option);
                  setOpen(false);
                }}
                style={noteStyle(option)}
                title={takenBy ? `#${takenBy}` : undefined}
                type="button"
              />
            );
          })}
        </div>
      </Popover>
      <input
        className="h-8 w-full rounded-input bg-transparent px-1 text-sm outline-none placeholder:text-ink-muted focus:bg-sunken"
        disabled={disabled}
        list={listId}
        maxLength={40}
        onBlur={() => {
          setFocused(false);
          setLastValue(draft);
          if (draft.trim() !== value.trim()) onCommit(draft.trim().replace(/\s+/g, " "));
        }}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={() => setFocused(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") setDraft(value);
        }}
        placeholder={t("library.categoryPlaceholder")}
        value={draft}
      />
      <datalist id={listId}>
        {suggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
    </div>
  );
}
