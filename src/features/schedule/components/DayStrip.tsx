"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCategoryColors } from "@/features/library/hooks/useCategoryColors";
import { useSchedule } from "@/features/schedule/hooks/useSchedule";
import { useTripWorkspace } from "@/features/trips/context/TripWorkspaceContext";
import { usePreferences } from "@/modules/preferences";
import { IconButton } from "@/shared/components/IconButton";
import { Popover } from "@/shared/components/Popover";
import { addDaysToKey, dateKeyOf, formatDateKey, tripDays, type DateKey } from "@/shared/time";
import { cn } from "@/shared/utils/cn";
import { noteStyle } from "@/shared/utils/hue";

type DayStripProps = { selected: DateKey; onSelect: (day: DateKey) => void };

const MAX_DOTS = 4;

export function DayStrip({ selected, onSelect }: DayStripProps) {
  const { locale, t } = usePreferences();
  const { trip } = useTripWorkspace();
  const { data: blocks = [] } = useSchedule(trip.id);
  const { hueOf } = useCategoryColors(trip.id, blocks.map((block) => block.library_item?.category));
  const days = useMemo(() => tripDays(trip.start_date, trip.end_date), [trip.start_date, trip.end_date]);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Dot per category (max 4) in that category's hue.
  const dots = useMemo(() => {
    const byDay = new Map<DateKey, Array<number | null>>();
    for (const block of blocks) {
      const key = dateKeyOf(block.start_at, trip.timezone);
      const hue = block.library_item ? hueOf(block.library_item.category) : block.hue;
      const list = byDay.get(key) ?? [];
      if (!list.includes(hue) && list.length < MAX_DOTS) list.push(hue);
      byDay.set(key, list);
    }
    return byDay;
  }, [blocks, hueOf, trip.timezone]);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [selected]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {days.map((day) => {
          const active = day === selected;
          return (
            <button
              aria-pressed={active}
              className={cn(
                "flex min-w-14 shrink-0 flex-col items-center rounded-chip px-2 py-2 transition-colors",
                active ? "bg-accent text-on-accent" : "hover:bg-sunken",
              )}
              key={day}
              onClick={() => onSelect(day)}
              ref={active ? selectedRef : undefined}
              type="button"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider opacity-70">
                {formatDateKey(day, locale, { weekday: "short" })}
              </span>
              <span className="text-lg font-bold leading-tight">{formatDateKey(day, locale, { day: "numeric" })}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider opacity-70">
                {formatDateKey(day, locale, { month: "short" })}
              </span>
              <span className="mt-1 flex h-1.5 gap-0.5">
                {(dots.get(day) ?? []).map((hue, index) => (
                  <span
                    className={cn("note-dot size-1.5 rounded-pill", hue === null && "note-neutral")}
                    key={index}
                    style={noteStyle(hue)}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <TripCalendarPopover days={days} label={t("schedule.pickDate")} onSelect={onSelect} selected={selected} />
    </div>
  );
}

function TripCalendarPopover({ days, selected, onSelect, label }: { days: DateKey[]; selected: DateKey; onSelect: (day: DateKey) => void; label: string }) {
  const { locale } = usePreferences();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(selected.slice(0, 7));
  const inTrip = new Set(days);

  const first = `${month}-01`;
  // Monday-first grid; noon UTC keeps the key on its own calendar day.
  const weekday = (new Date(`${first}T12:00:00Z`).getUTCDay() + 6) % 7;
  const cells: Array<DateKey | null> = Array.from({ length: weekday }, () => null);
  for (let key = first; key.startsWith(month); key = addDaysToKey(key, 1)) cells.push(key);
  const shift = (delta: number) => setMonth(addDaysToKey(`${month}-15`, delta * 30).slice(0, 7));

  return (
    <Popover
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setMonth(selected.slice(0, 7));
      }}
      open={open}
      trigger={
        <IconButton className="border border-line" label={label}>
          ▦
        </IconButton>
      }
      width={280}
      align="end"
    >
      <div className="mb-3 flex items-center justify-between">
        <IconButton label="‹" onClick={() => shift(-1)}>
          ‹
        </IconButton>
        <span className="text-sm font-semibold">{formatDateKey(first, locale, { month: "long", year: "numeric" })}</span>
        <IconButton label="›" onClick={() => shift(1)}>
          ›
        </IconButton>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {cells.map((key, index) =>
          key ? (
            <button
              className={cn(
                "h-8 rounded-input text-sm",
                key === selected ? "bg-accent text-on-accent" : inTrip.has(key) ? "hover:bg-sunken" : "text-ink-muted/40",
              )}
              disabled={!inTrip.has(key)}
              key={key}
              onClick={() => {
                onSelect(key);
                setOpen(false);
              }}
              type="button"
            >
              {Number(key.slice(8))}
            </button>
          ) : (
            <span key={`blank-${index}`} />
          ),
        )}
      </div>
    </Popover>
  );
}
