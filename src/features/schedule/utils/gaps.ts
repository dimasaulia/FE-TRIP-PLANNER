// Overlap prevention on one day. Everything is in minutes since the day start;
// the backend keeps a single lane, blocks may only touch at their edges.

export type Interval = { start: number; end: number };

export function sortIntervals(intervals: Interval[]) {
  return [...intervals].sort((a, b) => a.start - b.start);
}

/** Empty stretches inside bounds, in order. */
export function freeGaps(occupied: Interval[], bounds: Interval): Interval[] {
  const gaps: Interval[] = [];
  let cursor = bounds.start;
  for (const interval of sortIntervals(occupied)) {
    if (interval.end <= cursor) continue;
    if (interval.start >= bounds.end) break;
    if (interval.start > cursor) gaps.push({ start: cursor, end: Math.min(interval.start, bounds.end) });
    cursor = Math.max(cursor, interval.end);
  }
  if (cursor < bounds.end) gaps.push({ start: cursor, end: bounds.end });
  return gaps;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function distance(gap: Interval, desiredStart: number, duration: number) {
  const latestStart = gap.end - duration;
  if (desiredStart >= gap.start && desiredStart <= latestStart) return 0;
  return Math.min(Math.abs(desiredStart - gap.start), Math.abs(desiredStart - latestStart));
}

/**
 * Where a new block of `duration` goes when dropped at `desiredStart`: the
 * slot itself when free, else the nearest gap that fits, else the nearest gap
 * of at least `minDuration` with the duration cut down. Null when nothing fits.
 */
export function placeInGap(
  occupied: Interval[],
  bounds: Interval,
  desiredStart: number,
  duration: number,
  minDuration: number,
): Interval | null {
  const gaps = freeGaps(occupied, bounds);

  const fitting = gaps
    .filter((gap) => gap.end - gap.start >= duration)
    .sort((a, b) => distance(a, desiredStart, duration) - distance(b, desiredStart, duration));
  if (fitting.length) {
    const gap = fitting[0];
    const start = clamp(desiredStart, gap.start, gap.end - duration);
    return { start, end: start + duration };
  }

  const shorter = gaps
    .filter((gap) => gap.end - gap.start >= minDuration)
    .sort((a, b) => distance(a, desiredStart, minDuration) - distance(b, desiredStart, minDuration));
  if (!shorter.length) return null;
  const gap = shorter[0];
  return { start: gap.start, end: gap.end };
}

/** How far a block may move or grow before it touches a neighbour or the day edge. */
export function neighbourLimits(others: Interval[], self: Interval, bounds: Interval) {
  let min = bounds.start;
  let max = bounds.end;
  for (const other of others) {
    if (other.end <= self.start) min = Math.max(min, other.end);
    else if (other.start >= self.end) max = Math.min(max, other.start);
    else {
      // Already overlapping (should not happen); freeze in place.
      min = Math.max(min, self.start);
      max = Math.min(max, self.end);
    }
  }
  return { min, max };
}

export function overlaps(a: Interval, b: Interval) {
  return a.start < b.end && b.start < a.end;
}
