"use client";

import { Popover as RadixPopover } from "radix-ui";
import { useEffect, useRef, useState } from "react";
import { useBlockDrag } from "@/features/schedule/hooks/useBlockDrag";
import { usePreferences } from "@/modules/preferences";
import { Avatar } from "@/shared/components/Avatar";
import { formatDuration } from "@/shared/time";
import { cn } from "@/shared/utils/cn";
import { noteStyle } from "@/shared/utils/hue";
import { tokens } from "@/styles/tokens";
import type { ScheduleBlock } from "@/types/schedule.type";
import { BlockDetail } from "./BlockDetail";

type Person = { id: string; name: string; avatarUrl: string | null };

type ScheduleBlockCardProps = {
  block: ScheduleBlock;
  /** Minutes since the day start. */
  start: number;
  end: number;
  top: number;
  pxPerMinute: number;
  hue: number | null;
  /** Banner of the library item, shown behind a fade in the note colour. */
  bannerUrl: string | null;
  bannerHidden: boolean;
  onToggleBanner: () => void;
  onDragActive: (active: boolean) => void;
  timeZone: string;
  editable: boolean;
  creator: Person | null;
  movedBy: Person | null;
  limits: () => { min: number; max: number };
  formatRange: (start: number, end: number) => string;
  onPreview: (start: number, end: number) => void;
  onPreviewEnd: () => void;
  onCommit: (start: number, end: number) => void;
  onSave: (input: { title?: string | null; note?: string; hue?: number | null }) => void;
  onDelete: () => void;
  onOpenItem: (itemId: string) => void;
};

const KEY_STEP = 5;
const { minBlockMinutes } = tokens.timeline;

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg aria-hidden fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="14">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off ? <path d="M4 4l16 16" /> : null}
    </svg>
  );
}

function tiltFor(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return ((Math.abs(hash) % 13) - 6) / 10; // -0.6deg … 0.6deg, decoration only
}

export function ScheduleBlockCard(props: ScheduleBlockCardProps) {
  const { block, start, end, top, pxPerMinute, hue, timeZone, editable, creator, movedBy } = props;
  const bannerUrl = props.bannerHidden ? null : props.bannerUrl;
  const { t, locale } = usePreferences();
  const [open, setOpen] = useState(false);
  const [keyboard, setKeyboard] = useState<{ start: number; end: number } | null>(null);
  const keyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = block.id.startsWith("temp-");

  const { elementRef, labelRef, startDrag } = useBlockDrag({
    start,
    end,
    pxPerMinute,
    disabled: !editable || pending,
    limits: props.limits,
    formatRange: props.formatRange,
    onPreview: props.onPreview,
    onEnd: () => props.onPreviewEnd(),
    onCommit: props.onCommit,
    onClick: () => setOpen(true),
    onDragActive: props.onDragActive,
    onTrash: editable ? props.onDelete : undefined,
  });

  useEffect(() => () => {
    if (keyTimer.current) clearTimeout(keyTimer.current);
  }, []);

  // Keyboard nudges accumulate and commit once, so versions never race.
  function nudge(deltaStart: number, deltaEnd: number) {
    const base = keyboard ?? { start, end };
    const { min, max } = props.limits();
    let next = { start: base.start + deltaStart, end: base.end + deltaEnd };
    if (next.end - next.start < minBlockMinutes || next.start < min || next.end > max) return;
    next = { ...next };
    setKeyboard(next);
    props.onPreview(next.start, next.end);
    if (keyTimer.current) clearTimeout(keyTimer.current);
    keyTimer.current = setTimeout(() => {
      setKeyboard(null);
      props.onPreviewEnd();
      props.onCommit(next.start, next.end);
    }, 500);
  }

  const shown = keyboard ?? { start, end };
  const duration = shown.end - shown.start;
  const title = block.title ?? block.library_item?.title ?? "";
  const category = block.library_item?.category ?? (block.library_item ? null : t("schedule.noteCategory"));
  const height = Math.max(duration * pxPerMinute, 18);
  const compact = height < 44;

  return (
    <RadixPopover.Root onOpenChange={setOpen} open={open}>
      <RadixPopover.Anchor asChild>
        <div
          aria-label={`${title}, ${props.formatRange(shown.start, shown.end)}`}
          className={cn(
            "group absolute left-2 right-2 select-none outline-none transition-[top,height] duration-(--motion-base) ease-out",
            "data-[dragging]:z-30 data-[dragging]:transition-none",
            editable && !pending ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
            movedBy && "opacity-60",
          )}
          onKeyDown={(event) => {
            if (!editable) {
              if (event.key === "Enter") setOpen(true);
              return;
            }
            const shift = event.shiftKey;
            if (event.key === "ArrowUp") {
              event.preventDefault();
              if (shift) nudge(0, -KEY_STEP);
              else nudge(-KEY_STEP, -KEY_STEP);
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              if (shift) nudge(0, KEY_STEP);
              else nudge(KEY_STEP, KEY_STEP);
            } else if (event.key === "Enter") {
              setOpen(true);
            } else if (event.key === "Delete" || event.key === "Backspace") {
              props.onDelete();
            }
          }}
          onPointerDown={(event) => startDrag("move", event)}
          ref={elementRef}
          role="button"
          style={{
            top: top + (shown.start - start) * pxPerMinute,
            height,
          }}
          tabIndex={0}
        >
          <div
            className={cn(
              "note relative flex h-full flex-col overflow-hidden rounded-note px-3 transition-transform duration-(--motion-base)",
              hue === null && "note-neutral",
              compact ? "justify-center py-0.5" : "py-2",
            )}
            style={{ ...noteStyle(hue), transform: `rotate(${tiltFor(block.id)}deg)` }}
          >
            {bannerUrl ? (
              <>
                {/* object-cover keeps the image ratio: cropped to fit, never stretched. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  className="pointer-events-none absolute inset-0 size-full object-cover object-center"
                  draggable={false}
                  loading="lazy"
                  src={bannerUrl}
                />
                <span aria-hidden className="note-banner-fade pointer-events-none absolute inset-0" />
              </>
            ) : null}
            <div className="relative flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider opacity-70">
                  {category ? <span className="truncate">#{category}</span> : null}
                  <span className="shrink-0" ref={labelRef}>
                    {props.formatRange(shown.start, shown.end)}
                  </span>
                </p>
                {!compact ? <p className="mt-0.5 truncate text-sm font-semibold leading-tight">{title}</p> : null}
              </div>
              {!compact ? (
                <span
                  className={cn(
                    "shrink-0 text-lg font-bold leading-none tracking-tight",
                    bannerUrl ? "note-chip rounded-pill px-2 py-1 text-sm" : "opacity-80",
                  )}
                  style={bannerUrl ? noteStyle(hue) : undefined}
                >
                  {formatDuration(duration, locale)}
                </span>
              ) : (
                <span className="truncate text-xs font-semibold">{title}</span>
              )}
            </div>
            {duration >= 90 && creator ? (
              <p className="relative mt-auto flex items-center gap-1.5 text-[11px] opacity-80">
                <Avatar id={creator.id} name={creator.name} size={16} />
                {t("schedule.pastedBy", { name: creator.name.split(" ")[0] })}
              </p>
            ) : null}
            {props.bannerUrl ? (
              <button
                aria-label={t(props.bannerHidden ? "schedule.showBanner" : "schedule.hideBanner")}
                aria-pressed={!props.bannerHidden}
                className={cn(
                  "note-chip absolute bottom-1.5 right-2 inline-flex size-6 items-center justify-center rounded-pill text-xs shadow-sm transition-opacity",
                  "opacity-0 focus-visible:opacity-100 group-hover:opacity-100",
                  compact && "bottom-auto top-1/2 -translate-y-1/2 right-16",
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  props.onToggleBanner();
                }}
                onPointerDown={(event) => event.stopPropagation()}
                style={noteStyle(hue)}
                title={t(props.bannerHidden ? "schedule.showBanner" : "schedule.hideBanner")}
                type="button"
              >
                <EyeIcon off={props.bannerHidden} />
              </button>
            ) : null}
            {movedBy ? (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-pill bg-surface/90 px-2 py-0.5 text-[10px] font-semibold">
                {t("schedule.beingMoved")}
              </span>
            ) : null}
          </div>
          {editable && !pending ? (
            <>
              <span
                aria-hidden
                className="absolute inset-x-6 -top-1 h-2.5 cursor-ns-resize rounded-pill opacity-0 transition-opacity group-hover:opacity-100"
                onPointerDown={(event) => startDrag("top", event)}
              >
                <span className="mx-auto mt-1 block h-1 w-8 rounded-pill bg-ink/40" />
              </span>
              <span
                aria-hidden
                className="absolute inset-x-6 -bottom-1 h-2.5 cursor-ns-resize rounded-pill opacity-0 transition-opacity group-hover:opacity-100"
                onPointerDown={(event) => startDrag("bottom", event)}
              >
                <span className="mx-auto mt-0.5 block h-1 w-8 rounded-pill bg-ink/40" />
              </span>
            </>
          ) : null}
        </div>
      </RadixPopover.Anchor>
      <RadixPopover.Portal>
        <RadixPopover.Content
          align="start"
          className="z-50 max-h-[80vh] w-[22rem] overflow-y-auto rounded-card border border-line bg-surface p-4 shadow-xl"
          collisionPadding={16}
          side="right"
          sideOffset={10}
        >
          <BlockDetail
            block={block}
            editable={editable}
            hue={hue}
            onDelete={() => {
              setOpen(false);
              props.onDelete();
            }}
            onOpenItem={(itemId) => {
              setOpen(false);
              props.onOpenItem(itemId);
            }}
            onSave={props.onSave}
            timeZone={timeZone}
          />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
