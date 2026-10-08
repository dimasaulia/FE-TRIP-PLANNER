import { describe, expect, it } from "vitest";
import { freeGaps, neighbourLimits, placeInGap } from "./gaps";

const day = { start: 360, end: 1440 }; // 06:00–24:00
const busy = [
  { start: 540, end: 600 }, // 09:00–10:00
  { start: 600, end: 720 }, // 10:00–12:00 (touching is allowed)
  { start: 780, end: 840 }, // 13:00–14:00
];

describe("freeGaps", () => {
  it("lists the empty stretches", () => {
    expect(freeGaps(busy, day)).toEqual([
      { start: 360, end: 540 },
      { start: 720, end: 780 },
      { start: 840, end: 1440 },
    ]);
  });
});

describe("placeInGap", () => {
  it("keeps a free slot as is", () => {
    expect(placeInGap(busy, day, 900, 60, 15)).toEqual({ start: 900, end: 960 });
  });

  it("moves to the nearest gap that fits", () => {
    // dropped at 10:30 for 60 min: 12:00–13:00 fits right after the busy block
    expect(placeInGap(busy, day, 630, 60, 15)).toEqual({ start: 720, end: 780 });
  });

  it("cuts the duration when only a shorter gap is left", () => {
    const full = [
      { start: 360, end: 720 },
      { start: 750, end: 1440 },
    ];
    expect(placeInGap(full, day, 700, 120, 15)).toEqual({ start: 720, end: 750 });
  });

  it("rejects when no gap has the minimum duration", () => {
    expect(placeInGap([{ start: 360, end: 1440 }], day, 600, 60, 15)).toBeNull();
  });
});

describe("neighbourLimits", () => {
  it("stops at the neighbours", () => {
    const self = { start: 780, end: 840 };
    const others = busy.filter((interval) => interval.start !== 780);
    expect(neighbourLimits(others, self, day)).toEqual({ min: 720, max: 1440 });
  });
});
