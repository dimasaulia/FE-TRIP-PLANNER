"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/cn";

type InlineTextProps = {
  value: string;
  placeholder: string;
  editable: boolean;
  onCommit: (value: string) => void;
  /** Called on every keystroke (create mode keeps a live draft). */
  onDraft?: (value: string) => void;
  className?: string;
  ariaLabel: string;
  type?: "text" | "url";
  autoFocus?: boolean;
  maxLength?: number;
};

/** Notion-like field: click to edit, Enter saves, Esc restores the saved value. */
export function InlineText({ value, placeholder, editable, onCommit, onDraft, className, ariaLabel, type = "text", autoFocus, maxLength }: InlineTextProps) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const [lastValue, setLastValue] = useState(value);

  // Follow server/realtime changes while the field is not being edited.
  if (!focused && value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }

  return (
    <input
      aria-label={ariaLabel}
      autoFocus={autoFocus}
      className={cn(
        "w-full rounded-input bg-transparent px-1 outline-none transition-colors placeholder:text-ink-muted read-only:cursor-default",
        editable && "hover:bg-sunken focus:bg-sunken",
        className,
      )}
      maxLength={maxLength}
      onBlur={() => {
        setFocused(false);
        setLastValue(draft);
        if (draft !== value) onCommit(draft);
      }}
      onChange={(event) => {
        setDraft(event.target.value);
        onDraft?.(event.target.value);
      }}
      onFocus={() => setFocused(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          setDraft(value);
          onDraft?.(value);
          setFocused(false);
          requestAnimationFrame(() => event.currentTarget?.blur());
        }
      }}
      placeholder={placeholder}
      readOnly={!editable}
      type={type}
      value={draft}
    />
  );
}
