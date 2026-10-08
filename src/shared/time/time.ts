import { TZDate } from "@date-fns/tz";

// All time math of the app. State holds Date instants; trip dates stay
// `YYYY-MM-DD` strings ("date keys") that mean calendar days in the trip timezone.

export type DateKey = string;

const MINUTE = 60_000;

function splitKey(key: DateKey) {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month, day };
}

/** Calendar arithmetic on a date key, independent of any timezone. */
export function addDaysToKey(key: DateKey, days: number): DateKey {
  const { year, month, day } = splitKey(key);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function tripDays(startDate: DateKey, endDate: DateKey): DateKey[] {
  const days: DateKey[] = [];
  for (let key = startDate; key <= endDate && days.length < 400; key = addDaysToKey(key, 1)) {
    days.push(key);
  }
  return days;
}

/** The instant a calendar day starts in the timezone. */
export function dayStart(key: DateKey, timeZone: string): Date {
  const { year, month, day } = splitKey(key);
  return new Date(new TZDate(year, month - 1, day, 0, 0, 0, 0, timeZone).getTime());
}

/** Start and end instants of a trip day; a DST day lasts 23 or 25 hours. */
export function dayBounds(key: DateKey, timeZone: string) {
  return { start: dayStart(key, timeZone), end: dayStart(addDaysToKey(key, 1), timeZone) };
}

export function tripRange(startDate: DateKey, endDate: DateKey, timeZone: string) {
  return { start: dayStart(startDate, timeZone), end: dayStart(addDaysToKey(endDate, 1), timeZone) };
}

/** The calendar day an instant falls on in the timezone. */
export function dateKeyOf(date: Date, timeZone: string): DateKey {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** Real minutes elapsed since the day started; this is the vertical position. */
export function minutesOfDay(date: Date, key: DateKey, timeZone: string) {
  return (date.getTime() - dayStart(key, timeZone).getTime()) / MINUTE;
}

export function atMinutes(key: DateKey, timeZone: string, minutes: number): Date {
  return new Date(dayStart(key, timeZone).getTime() + minutes * MINUTE);
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * MINUTE);
}

export function diffMinutes(later: Date, earlier: Date) {
  return Math.round((later.getTime() - earlier.getTime()) / MINUTE);
}

export function snap(minutes: number, step: number) {
  return Math.round(minutes / step) * step;
}

export function snapDate(date: Date, key: DateKey, timeZone: string, step: number) {
  return atMinutes(key, timeZone, snap(minutesOfDay(date, key, timeZone), step));
}

export function formatTime(date: Date, timeZone: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);
}

export function formatTimeRange(start: Date, end: Date, timeZone: string, locale: string) {
  return `${formatTime(start, timeZone, locale)}–${formatTime(end, timeZone, locale)}`;
}

/** Formats a date key without ever creating a local Date (noon UTC is safe). */
export function formatDateKey(key: DateKey, locale: string, options: Intl.DateTimeFormatOptions) {
  const { year, month, day } = splitKey(key);
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

export function formatDateRange(startDate: DateKey, endDate: DateKey, locale: string) {
  const start = formatDateKey(startDate, locale, { day: "numeric", month: "short" });
  const end = formatDateKey(endDate, locale, { day: "numeric", month: "short", year: "numeric" });
  return startDate === endDate ? end : `${start} – ${end}`;
}

export function formatDuration(minutes: number, locale: string) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const h = locale.startsWith("id") ? "j" : "h";
  if (hours && rest) return `${hours}${h} ${rest}m`;
  if (hours) return `${hours}${h}`;
  return `${rest}m`;
}

/** "WIB, UTC+7" style label of a timezone at a given instant. */
export function zoneLabel(timeZone: string, at: Date, locale: string) {
  const part = (style: "short" | "shortOffset") =>
    new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: style })
      .formatToParts(at)
      .find((piece) => piece.type === "timeZoneName")?.value ?? "";
  const offset = part("shortOffset").replace("GMT", "UTC");
  const name = part("short");
  return name && name !== part("shortOffset") ? `${name}, ${offset === "UTC" ? "UTC+0" : offset}` : offset;
}

export function browserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** Value for an `<input type="datetime-local">` showing the instant in the trip timezone. */
export function toLocalInputValue(date: Date, timeZone: string) {
  const local = new TZDate(date.getTime(), timeZone);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`;
}

export function fromLocalInputValue(value: string, timeZone: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match.map(Number);
  return new Date(new TZDate(year, month - 1, day, hour, minute, 0, 0, timeZone).getTime());
}

export function todayKey(timeZone: string) {
  return dateKeyOf(new Date(), timeZone);
}
