"use client";

import { useMemo, useState } from "react";
import { useSchedule } from "@/features/schedule/hooks/useSchedule";
import { buildDayLayout } from "@/features/schedule/utils/day-layout";
import { placeInGap } from "@/features/schedule/utils/gaps";
import { useTripWorkspace } from "@/features/trips/context/TripWorkspaceContext";
import { usePreferences } from "@/modules/preferences";
import { Button } from "@/shared/components/Button";
import { Field, Select, TextInput } from "@/shared/components/Field";
import { Popover } from "@/shared/components/Popover";
import { formatDateKey, tripDays, type DateKey } from "@/shared/time";
import { tokens } from "@/styles/tokens";
import type { LibrarySummary } from "@/types/library.type";

type AddToSchedulePopoverProps = {
  item: LibrarySummary;
  day: DateKey;
  trigger: React.ReactNode;
  onPlace: (day: DateKey, minutes: number) => boolean;
};

function toTimeValue(minutes: number) {
  const hours = Math.floor(minutes / 60) % 24;
  return `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** Keyboard and small-screen path to "paste" an item without dragging. */
export function AddToSchedulePopover({ item, day, trigger, onPlace }: AddToSchedulePopoverProps) {
  const { t, locale } = usePreferences();
  const { trip } = useTripWorkspace();
  const { data: blocks = [] } = useSchedule(trip.id);
  const [open, setOpen] = useState(false);
  const [chosenDay, setChosenDay] = useState(day);
  const [time, setTime] = useState<string | null>(null);
  const days = useMemo(() => tripDays(trip.start_date, trip.end_date), [trip.start_date, trip.end_date]);

  // Suggest the first free slot from 09:00 on the chosen day.
  const suggestion = useMemo(() => {
    const layout = buildDayLayout(blocks, chosenDay, trip.timezone, trip.start_date, trip.end_date);
    const placed = placeInGap(layout.occupied, layout.bounds, 9 * 60, item.default_duration_min || 60, tokens.timeline.minBlockMinutes);
    return placed ? toTimeValue(placed.start) : "09:00";
  }, [blocks, chosenDay, item.default_duration_min, trip.end_date, trip.start_date, trip.timezone]);

  const fixed = item.kind === "event" && item.fixed_start_at && item.fixed_end_at;

  return (
    <Popover
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setChosenDay(day);
          setTime(null);
        }
      }}
      open={open}
      trigger={trigger}
      width={260}
    >
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const [hours, minutes] = (time ?? suggestion).split(":").map(Number);
          if (onPlace(chosenDay, hours * 60 + minutes)) setOpen(false);
        }}
      >
        <p className="text-sm font-semibold">{t("schedule.addTitle", { title: item.title })}</p>
        {fixed ? (
          <p className="text-xs text-ink-muted">{t("schedule.fixedHint")}</p>
        ) : (
          <>
            <Field label={t("schedule.day")}>
              <Select onChange={(event) => setChosenDay(event.target.value)} value={chosenDay}>
                {days.map((key) => (
                  <option key={key} value={key}>
                    {formatDateKey(key, locale, { weekday: "short", day: "numeric", month: "short" })}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("schedule.time")}>
              <TextInput onChange={(event) => setTime(event.target.value)} step={900} type="time" value={time ?? suggestion} />
            </Field>
          </>
        )}
        <Button className="w-full" type="submit">
          {t("schedule.place")}
        </Button>
      </form>
    </Popover>
  );
}
