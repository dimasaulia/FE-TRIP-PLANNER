import { describe, expect, it } from "vitest";
import {
  addDaysToKey,
  atMinutes,
  dateKeyOf,
  dayBounds,
  formatTime,
  fromLocalInputValue,
  minutesOfDay,
  snap,
  toLocalInputValue,
  tripDays,
  zoneLabel,
} from "./time";

describe("dayBounds", () => {
  it.each([
    ["Asia/Jakarta", "2026-12-29", "2026-12-28T17:00:00.000Z", 24],
    ["Asia/Makassar", "2026-12-29", "2026-12-28T16:00:00.000Z", 24],
    ["America/New_York", "2026-03-08", "2026-03-08T05:00:00.000Z", 23],
    ["America/New_York", "2026-11-01", "2026-11-01T04:00:00.000Z", 25],
  ])("%s %s", (zone, key, start, hours) => {
    const bounds = dayBounds(key, zone);
    expect(bounds.start.toISOString()).toBe(start);
    expect((bounds.end.getTime() - bounds.start.getTime()) / 3_600_000).toBe(hours);
  });
});

describe("minutes and snapping", () => {
  it("measures the vertical position from the trip day start", () => {
    const date = new Date("2026-12-29T03:30:00Z"); // 10:30 WIB
    expect(minutesOfDay(date, "2026-12-29", "Asia/Jakarta")).toBe(630);
    expect(atMinutes("2026-12-29", "Asia/Jakarta", 630).toISOString()).toBe(date.toISOString());
  });

  it("snaps to the nearest step", () => {
    expect(snap(7, 15)).toBe(0);
    expect(snap(8, 15)).toBe(15);
    expect(snap(52, 5)).toBe(50);
  });

  it("formats in the trip timezone, not the browser one", () => {
    expect(formatTime(new Date("2026-12-29T03:30:00Z"), "Asia/Makassar", "id-ID")).toBe("11.30");
    expect(formatTime(new Date("2026-12-29T03:30:00Z"), "Asia/Jakarta", "en-GB")).toBe("10:30");
  });
});

describe("date keys", () => {
  it("never shifts by the browser timezone", () => {
    expect(addDaysToKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(tripDays("2026-12-29", "2027-01-01")).toEqual(["2026-12-29", "2026-12-30", "2026-12-31", "2027-01-01"]);
    expect(dateKeyOf(new Date("2026-12-28T17:30:00Z"), "Asia/Jakarta")).toBe("2026-12-29");
  });

  it("round trips datetime-local values in the trip timezone", () => {
    const date = fromLocalInputValue("2026-12-29T19:45", "Asia/Jakarta");
    expect(date?.toISOString()).toBe("2026-12-29T12:45:00.000Z");
    expect(toLocalInputValue(date!, "Asia/Jakarta")).toBe("2026-12-29T19:45");
  });

  it("labels the zone with its UTC offset", () => {
    expect(zoneLabel("Asia/Jakarta", new Date("2026-12-29T00:00:00Z"), "en-GB")).toContain("UTC+7");
  });
});
