"use client";

import { useDroppable } from "@dnd-kit/core";
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useCategoryColors } from "@/features/library/hooks/useCategoryColors";
import { useLibrary } from "@/features/library/hooks/useLibrary";
import { useCreateBlock, useDeleteBlock, useSchedule, useUpdateBlock } from "@/features/schedule/hooks/useSchedule";
import { usePreviewStore } from "@/features/schedule/stores/preview.store";
import { useShownBanners } from "@/features/schedule/hooks/useShownBanners";
import { TRASH_ZONE_ID } from "@/features/schedule/hooks/useBlockDrag";
import { buildDayLayout } from "@/features/schedule/utils/day-layout";
import { neighbourLimits, placeInGap, type Interval } from "@/features/schedule/utils/gaps";
import { useMemberName, useTripWorkspace } from "@/features/trips/context/TripWorkspaceContext";
import { useTripPermission } from "@/modules/auth/hooks/useTripPermission";
import { usePreferences } from "@/modules/preferences";
import { Avatar } from "@/shared/components/Avatar";
import { Spinner } from "@/shared/components/Spinner";
import { toast } from "@/shared/components/Toast";
import {
  atMinutes,
  browserTimeZone,
  dateKeyOf,
  formatDateKey,
  formatTime,
  minutesOfDay,
  snap,
  zoneLabel,
  type DateKey,
} from "@/shared/time";
import { cn } from "@/shared/utils/cn";
import { noteStyle } from "@/shared/utils/hue";
import { tokens } from "@/styles/tokens";
import type { LibrarySummary } from "@/types/library.type";
import { ScheduleBlockCard } from "./ScheduleBlockCard";

export const TIMELINE_DROP_ID = "schedule-timeline";

export type TimelineHandle = {
  hover: (clientY: number, item: LibrarySummary) => void;
  drop: (clientY: number, item: LibrarySummary) => void;
  leave: () => void;
  /** Keyboard / touch path: place at a given time of the selected day. */
  placeAt: (day: DateKey, minutes: number, item: LibrarySummary) => boolean;
};

type ScheduleTimelineProps = {
  dayKey: DateKey;
  onDayChange: (day: DateKey) => void;
  onOpenItem: (itemId: string) => void;
};

type Ghost = { interval: Interval | null; item: LibrarySummary };

const { hourHeight, snapMinutes, minBlockMinutes, gutterWidth } = tokens.timeline;
const PX_PER_MINUTE = hourHeight / 60;

export const ScheduleTimeline = forwardRef<TimelineHandle, ScheduleTimelineProps>(function ScheduleTimeline(
  { dayKey, onDayChange, onOpenItem },
  ref,
) {
  const { t, locale } = usePreferences();
  const { trip, me, send } = useTripWorkspace();
  const memberOf = useMemberName();
  const editable = useTripPermission("content.edit");
  const tz = trip.timezone;
  const { data: blocks = [], isPending } = useSchedule(trip.id);
  const createBlock = useCreateBlock(trip.id, me.id);
  const updateBlock = useUpdateBlock(trip.id);
  const deleteBlock = useDeleteBlock(trip.id, me.id);
  const previews = usePreviewStore((state) => state.previews);
  const { data: library = [] } = useLibrary(trip.id);
  // Banners come from the library cache, so they follow realtime item edits.
  const banners = useMemo(() => new Map(library.map((item) => [item.id, item.banner_url])), [library]);
  const columnRef = useRef<HTMLDivElement | null>(null);
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [draft, setDraft] = useState<(Interval & { hue: number | null }) | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [draggingBlock, setDraggingBlock] = useState(false);
  const { shown: shownBanners, toggle: toggleBanner } = useShownBanners(trip.id);
  const { setNodeRef, isOver } = useDroppable({ id: TIMELINE_DROP_ID, disabled: !editable });

  const layout = useMemo(
    () => buildDayLayout(blocks, dayKey, tz, trip.start_date, trip.end_date),
    [blocks, dayKey, tz, trip.start_date, trip.end_date],
  );
  const { hueOf } = useCategoryColors(
    trip.id,
    blocks.map((block) => block.library_item?.category),
  );

  const range = layout.range;
  const height = (range.end - range.start) * PX_PER_MINUTE;
  const fmt = (minutes: number) => formatTime(atMinutes(dayKey, tz, minutes), tz, locale);
  const formatRange = (start: number, end: number) => `${fmt(start)}–${fmt(end)}`;
  const topOf = (minutes: number) => (minutes - range.start) * PX_PER_MINUTE;

  function minutesAt(clientY: number) {
    const rect = columnRef.current?.getBoundingClientRect();
    if (!rect) return range.start;
    return range.start + (clientY - rect.top) / PX_PER_MINUTE;
  }

  function placementFor(item: LibrarySummary, desiredStart: number, day: DateKey = dayKey) {
    if (item.kind === "event" && item.fixed_start_at && item.fixed_end_at) {
      // Events with a fixed time stick to it, whatever day is shown.
      const fixedDay = dateKeyOf(item.fixed_start_at, tz);
      const dayLayout = fixedDay === dayKey ? layout : buildDayLayout(blocks, fixedDay, tz, trip.start_date, trip.end_date);
      const interval = {
        start: minutesOfDay(item.fixed_start_at, fixedDay, tz),
        end: minutesOfDay(item.fixed_end_at, fixedDay, tz),
      };
      const free = !dayLayout.occupied.some((other) => other.start < interval.end && interval.start < other.end);
      return { day: fixedDay, interval: free ? interval : null };
    }
    const dayLayout = day === dayKey ? layout : buildDayLayout(blocks, day, tz, trip.start_date, trip.end_date);
    const duration = item.default_duration_min || 60;
    return {
      day,
      interval: placeInGap(dayLayout.occupied, dayLayout.bounds, snap(desiredStart, snapMinutes), duration, minBlockMinutes),
    };
  }

  function createFromItem(item: LibrarySummary, day: DateKey, interval: Interval) {
    createBlock.mutate({
      library_item_id: item.id,
      start_at: atMinutes(day, tz, interval.start),
      end_at: atMinutes(day, tz, interval.end),
      item,
    });
    if (day !== dayKey) onDayChange(day);
    const message = t("schedule.placed", {
      title: item.title,
      day: formatDateKey(day, locale, { day: "numeric", month: "short" }),
      range: `${formatTime(atMinutes(day, tz, interval.start), tz, locale)}–${formatTime(atMinutes(day, tz, interval.end), tz, locale)}`,
    });
    setAnnouncement(message);
  }

  useImperativeHandle(ref, () => ({
    hover: (clientY, item) => {
      const placement = placementFor(item, minutesAt(clientY));
      setGhost({ interval: placement.day === dayKey ? placement.interval : null, item });
    },
    drop: (clientY, item) => {
      setGhost(null);
      const placement = placementFor(item, minutesAt(clientY));
      if (!placement.interval) {
        toast({ message: t("schedule.noSlot"), tone: "error" });
        return;
      }
      createFromItem(item, placement.day, placement.interval);
    },
    leave: () => setGhost(null),
    placeAt: (day, minutes, item) => {
      const placement = placementFor(item, minutes, day);
      if (!placement.interval) {
        toast({ message: t("schedule.noSlot"), tone: "error" });
        return false;
      }
      createFromItem(item, placement.day, placement.interval);
      return true;
    },
  }));

  function commitMove(blockId: string, start: number, end: number) {
    const block = blocks.find((entry) => entry.id === blockId);
    if (!block) return;
    const startAt = atMinutes(dayKey, tz, start);
    const endAt = atMinutes(dayKey, tz, end);
    updateBlock.mutate({ block, input: { start_at: startAt, end_at: endAt } });
    setAnnouncement(t("schedule.moved", { title: block.title ?? block.library_item?.title ?? "", range: formatRange(start, end) }));
  }

  function createDraft(title: string) {
    if (!draft || !title.trim()) {
      setDraft(null);
      return;
    }
    const interval = draft;
    setDraft(null);
    createBlock.mutate({
      title: title.trim(),
      hue: interval.hue,
      start_at: atMinutes(dayKey, tz, interval.start),
      end_at: atMinutes(dayKey, tz, interval.end),
    });
  }

  const hours: number[] = [];
  for (let minute = Math.ceil(range.start / 60) * 60; minute < range.end; minute += 60) hours.push(minute);

  const remotePreviews = Object.values(previews).filter((preview) => {
    const start = minutesOfDay(preview.start, dayKey, tz);
    return start >= range.start - 24 * 60 && start < range.end && dateKeyOf(preview.start, tz) === dayKey;
  });

  const now = new Date();
  const nowMinutes = dateKeyOf(now, tz) === dayKey ? minutesOfDay(now, dayKey, tz) : null;
  const showZone = browserTimeZone() !== tz;

  return (
    <div className="relative">
      {/* Drag a block here to delete it (undo stays available in the toast). */}
      <div
        aria-hidden={!draggingBlock}
        className={cn(
          "trash-zone fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-pill border-2 border-dashed border-danger bg-surface px-6 py-3 text-sm font-semibold text-danger shadow-xl transition-[opacity,transform,background,color] duration-(--motion-fast) lg:left-[calc((100%-var(--library-width,400px))/2)]",
          draggingBlock ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        id={TRASH_ZONE_ID}
      >
        <svg aria-hidden fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
          <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
        </svg>
        {t("schedule.dropToDelete")}
      </div>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      {showZone ? (
        <p className="mb-2 pl-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
          {t("schedule.timezone", { zone: zoneLabel(tz, atMinutes(dayKey, tz, 12 * 60), locale) })}
        </p>
      ) : null}
      <div className="relative flex" style={{ height }}>
        <div className="shrink-0" style={{ width: gutterWidth }}>
          {hours.map((minute) => (
            <span
              className="absolute -translate-y-1/2 font-mono text-[11px] text-ink-muted"
              key={minute}
              style={{ top: topOf(minute) }}
            >
              {String(Math.floor(minute / 60) % 24).padStart(2, "0")}:00
            </span>
          ))}
        </div>
        <div
          className={cn(
            "relative flex-1 rounded-panel transition-colors",
            isOver ? "bg-accent-soft" : "bg-transparent",
          )}
          onDoubleClick={(event) => {
            if (!editable || event.target !== event.currentTarget) return;
            const start = snap(minutesAt(event.clientY) - 15, snapMinutes);
            const placed = placeInGap(layout.occupied, layout.bounds, start, 60, minBlockMinutes);
            if (placed) setDraft({ ...placed, hue: null });
            else toast({ message: t("schedule.noSlot"), tone: "error" });
          }}
          ref={(node) => {
            columnRef.current = node;
            setNodeRef(node);
          }}
        >
          {hours.map((minute) => (
            <div key={minute}>
              <div className="pointer-events-none absolute inset-x-0 h-px bg-line" style={{ top: topOf(minute) }} />
              <div className="half-hour-line pointer-events-none absolute inset-x-0 h-px" style={{ top: topOf(minute + 30) }} />
            </div>
          ))}

          {nowMinutes !== null && nowMinutes >= range.start && nowMinutes <= range.end ? (
            <div className="pointer-events-none absolute inset-x-0 z-20 h-0.5 bg-accent" style={{ top: topOf(nowMinutes) }}>
              <span className="absolute -left-1 -top-1 size-2.5 rounded-pill bg-accent" />
            </div>
          ) : null}

          {isPending ? (
            <div className="absolute inset-0 flex items-start justify-center pt-20">
              <Spinner />
            </div>
          ) : null}

          {!isPending && layout.blocks.length === 0 && !ghost && !draft ? (
            <div className="pointer-events-none absolute inset-x-6 top-24 rounded-card border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-muted">
              {editable ? t("schedule.emptyEditor") : t("schedule.emptyViewer")}
            </div>
          ) : null}

          {layout.blocks.map((block) => {
            const start = minutesOfDay(block.start_at, dayKey, tz);
            const end = minutesOfDay(block.end_at, dayKey, tz);
            const creator = memberOf(block.created_by);
            const preview = previews[block.id];
            const mover = preview ? memberOf(preview.userId) : null;
            return (
              <ScheduleBlockCard
                block={block}
                creator={creator ? { id: creator.user_id, name: creator.name, avatarUrl: creator.avatar_url } : null}
                editable={editable}
                end={end}
                formatRange={formatRange}
                bannerHidden={!shownBanners.has(block.id)}
                bannerUrl={block.library_item_id ? (banners.get(block.library_item_id) ?? null) : null}
                onDragActive={setDraggingBlock}
                onToggleBanner={() => toggleBanner(block.id)}
                hue={block.library_item ? hueOf(block.library_item.category) : block.hue}
                key={block.id}
                limits={() =>
                  neighbourLimits(
                    layout.occupied.filter((other) => other.id !== block.id),
                    { start, end },
                    layout.bounds,
                  )
                }
                movedBy={mover ? { id: mover.user_id, name: mover.name, avatarUrl: mover.avatar_url } : null}
                onCommit={(nextStart, nextEnd) => commitMove(block.id, nextStart, nextEnd)}
                onDelete={() => {
                  deleteBlock.mutate(block);
                  setAnnouncement(t("schedule.deleted"));
                }}
                onOpenItem={onOpenItem}
                onPreview={(nextStart, nextEnd) =>
                  send("block.preview", {
                    id: block.id,
                    start_at: atMinutes(dayKey, tz, nextStart),
                    end_at: atMinutes(dayKey, tz, nextEnd),
                  })
                }
                onPreviewEnd={() => send("block.preview_end", { id: block.id })}
                onSave={(input) => updateBlock.mutate({ block, input })}
                pxPerMinute={PX_PER_MINUTE}
                start={start}
                timeZone={tz}
                top={topOf(start)}
              />
            );
          })}

          {remotePreviews.map((preview) => {
            const start = minutesOfDay(preview.start, dayKey, tz);
            const end = minutesOfDay(preview.end, dayKey, tz);
            const mover = memberOf(preview.userId);
            const name = mover?.name.split(" ")[0] ?? "";
            return (
              <div
                className="pointer-events-none absolute left-2 right-2 z-20 rounded-note border-2 border-dashed border-ink/30 bg-surface/40 transition-[top,height] duration-(--motion-fast)"
                key={preview.blockId}
                style={{ top: topOf(start), height: (end - start) * PX_PER_MINUTE }}
              >
                <span className="absolute -bottom-3 right-3 flex items-center gap-1.5 rounded-pill bg-ink px-2 py-0.5 text-[11px] font-semibold text-page shadow">
                  {mover ? <Avatar id={mover.user_id} name={mover.name} size={16} /> : null}
                  {t("schedule.someoneMoving", { name })}
                </span>
              </div>
            );
          })}

          {ghost ? (
            ghost.interval ? (
              <div
                className="pointer-events-none absolute left-2 right-2 z-20 flex items-start rounded-note border-2 border-dashed border-accent bg-accent-soft px-3 py-2"
                style={{ top: topOf(ghost.interval.start), height: (ghost.interval.end - ghost.interval.start) * PX_PER_MINUTE }}
              >
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-accent">
                  {t("schedule.dropAt", { range: formatRange(ghost.interval.start, ghost.interval.end) })}
                </span>
              </div>
            ) : (
              <div className="pointer-events-none absolute inset-x-6 top-6 z-20 rounded-card bg-ink px-3 py-2 text-center text-xs font-semibold text-page">
                {t("schedule.noSlot")}
              </div>
            )
          ) : null}

          {draft ? (
            <div
              className={cn("note absolute left-2 right-2 z-20 rounded-note px-3 py-2", draft.hue === null && "note-neutral")}
              style={{ ...noteStyle(draft.hue), top: topOf(draft.start), height: (draft.end - draft.start) * PX_PER_MINUTE }}
            >
              <p className="font-mono text-[10px] uppercase tracking-wider opacity-70">
                #{t("schedule.noteCategory")} {formatRange(draft.start, draft.end)}
              </p>
              <input
                aria-label={t("schedule.title")}
                autoFocus
                className="mt-0.5 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-ink/40"
                onBlur={(event) => createDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                  if (event.key === "Escape") {
                    event.currentTarget.value = "";
                    event.currentTarget.blur();
                  }
                }}
                placeholder={t("schedule.draftPlaceholder")}
              />
              {/* Colour while typing; mousedown is cancelled so the title keeps focus. */}
              <div
                aria-label={t("schedule.color")}
                className="absolute left-0 top-full mt-2 flex gap-1 rounded-pill border border-line bg-surface p-1.5 shadow-lg"
                onMouseDown={(event) => event.preventDefault()}
                role="radiogroup"
              >
                {[null, ...tokens.note.paletteHues].map((hue) => (
                  <button
                    aria-checked={draft.hue === hue}
                    aria-label={hue === null ? t("schedule.colorNeutral") : String(hue)}
                    className={cn(
                      "note-dot size-5 rounded-pill",
                      hue === null && "note-neutral",
                      draft.hue === hue && "ring-2 ring-ink ring-offset-1 ring-offset-surface",
                    )}
                    key={hue ?? "neutral"}
                    onClick={() => setDraft({ ...draft, hue })}
                    role="radio"
                    style={noteStyle(hue)}
                    type="button"
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
});
