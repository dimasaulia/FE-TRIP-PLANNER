"use client";

import { createPortal } from "react-dom";
import { usePreferences } from "@/modules/preferences";
import type { TranslationKey } from "@/modules/preferences";
import { cn } from "@/shared/utils/cn";
import type { SlashCommandId } from "./extensions";

const hints: Record<SlashCommandId, string> = {
  h1: "H1",
  h2: "H2",
  h3: "H3",
  link: "↗",
  bullet: "•",
  ordered: "1.",
  task: "☐",
  quote: "❝",
  code: "</>",
  divider: "—",
  image: "▣",
};

type SlashMenuProps = {
  items: SlashCommandId[];
  selected: number;
  rect: DOMRect | null;
  onSelect: (id: SlashCommandId) => void;
  onHover: (index: number) => void;
};

export function slashLabelKey(id: SlashCommandId): TranslationKey {
  return `editor.slash.${id}` as TranslationKey;
}

export function SlashMenu({ items, selected, rect, onSelect, onHover }: SlashMenuProps) {
  const { t } = usePreferences();
  if (!rect) return null;

  // Open below the caret, or above it when the space below is too small.
  const below = window.innerHeight - rect.bottom > 340;
  const position = below ? { top: rect.bottom + 6 } : { bottom: window.innerHeight - rect.top + 6 };
  return createPortal(
    <div
      aria-label={t("editor.slash.title")}
      className="fixed z-50 max-h-80 w-60 overflow-y-auto rounded-card border border-line bg-surface p-1 shadow-xl"
      role="listbox"
      style={{ ...position, left: Math.min(rect.left, window.innerWidth - 256) }}
    >
      {items.length === 0 ? (
        <p className="px-3 py-2 text-sm text-ink-muted">{t("editor.slash.empty")}</p>
      ) : (
        items.map((id, index) => (
          <button
            aria-selected={index === selected}
            className={cn(
              "flex w-full items-center gap-3 rounded-input px-2 py-1.5 text-left text-sm",
              index === selected ? "bg-sunken" : "hover:bg-sunken",
            )}
            key={id}
            onMouseDown={(event) => {
              event.preventDefault();
              onSelect(id);
            }}
            onMouseEnter={() => onHover(index)}
            role="option"
            type="button"
          >
            <span className="inline-flex size-7 items-center justify-center rounded-input bg-sunken-strong font-mono text-xs">
              {hints[id]}
            </span>
            {t(slashLabelKey(id))}
          </button>
        ))
      )}
    </div>,
    document.body,
  );
}
