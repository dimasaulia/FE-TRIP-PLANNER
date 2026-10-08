import { dayBounds, minutesOfDay, tripRange, type DateKey } from "@/shared/time";
import { tokens } from "@/styles/tokens";
import type { ScheduleBlock } from "@/types/schedule.type";
import type { Interval } from "./gaps";

export type DayLayout = {
  dayKey: DateKey;
  /** Blocks that start on this day. */
  blocks: ScheduleBlock[];
  /** Every block touching this day, as minutes since its start (for overlap checks). */
  occupied: Array<Interval & { id: string }>;
  /** Visible column: 06:00–24:00, widened for blocks outside it. */
  range: Interval;
  /** Where blocks may go: the visible range clipped to the trip dates. */
  bounds: Interval;
};

const { startHour, endHour } = tokens.timeline;

export function buildDayLayout(
  allBlocks: ScheduleBlock[],
  dayKey: DateKey,
  timeZone: string,
  tripStart: DateKey,
  tripEnd: DateKey,
): DayLayout {
  const { start, end } = dayBounds(dayKey, timeZone);
  const dayLength = (end.getTime() - start.getTime()) / 60_000;

  const blocks = allBlocks
    .filter((block) => block.start_at >= start && block.start_at < end)
    .sort((a, b) => a.start_at.getTime() - b.start_at.getTime());

  const occupied = allBlocks
    .filter((block) => block.end_at > start && block.start_at.getTime() < end.getTime() + 24 * 3_600_000)
    .map((block) => ({
      id: block.id,
      start: minutesOfDay(block.start_at, dayKey, timeZone),
      end: minutesOfDay(block.end_at, dayKey, timeZone),
    }));

  let rangeStart = startHour * 60;
  let rangeEnd = Math.max(endHour * 60, dayLength);
  for (const block of blocks) {
    const blockStart = minutesOfDay(block.start_at, dayKey, timeZone);
    const blockEnd = minutesOfDay(block.end_at, dayKey, timeZone);
    rangeStart = Math.min(rangeStart, Math.floor(blockStart / 60) * 60);
    rangeEnd = Math.max(rangeEnd, Math.ceil(blockEnd / 60) * 60);
  }

  const trip = tripRange(tripStart, tripEnd, timeZone);
  const tripStartMin = (trip.start.getTime() - start.getTime()) / 60_000;
  const tripEndMin = (trip.end.getTime() - start.getTime()) / 60_000;

  return {
    dayKey,
    blocks,
    occupied,
    range: { start: rangeStart, end: rangeEnd },
    bounds: { start: Math.max(rangeStart, tripStartMin), end: Math.min(rangeEnd, tripEndMin) },
  };
}
