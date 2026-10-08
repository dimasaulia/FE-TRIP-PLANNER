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
  /** Visible column: the whole day from 00:00, widened past 24:00 for late blocks. */
  range: Interval;
  /** Minute to scroll to when the day opens: the first block, else 06:00. */
  scrollTo: number;
  /** Where blocks may go: the visible range clipped to the trip dates. */
  bounds: Interval;
};

const { scrollToHour, endHour } = tokens.timeline;

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

  const rangeStart = 0;
  let rangeEnd = Math.max(endHour * 60, dayLength);
  for (const block of blocks) {
    rangeEnd = Math.max(rangeEnd, Math.ceil(minutesOfDay(block.end_at, dayKey, timeZone) / 60) * 60);
  }
  const scrollTo = blocks.length ? minutesOfDay(blocks[0].start_at, dayKey, timeZone) : scrollToHour * 60;

  const trip = tripRange(tripStart, tripEnd, timeZone);
  const tripStartMin = (trip.start.getTime() - start.getTime()) / 60_000;
  const tripEndMin = (trip.end.getTime() - start.getTime()) / 60_000;

  return {
    dayKey,
    blocks,
    occupied,
    range: { start: rangeStart, end: rangeEnd },
    scrollTo,
    bounds: { start: Math.max(rangeStart, tripStartMin), end: Math.min(rangeEnd, tripEndMin) },
  };
}
