// The API speaks UTC strings ending in `Z`; the app only holds Date instants.
// Conversion happens here and nowhere else.

const UTC_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/** JSON reviver turning every `*_at` UTC string into a Date. */
export function reviveDates(key: string, value: unknown) {
  if (typeof value === "string" && (key.endsWith("_at") || key === "server_time") && UTC_INSTANT.test(value)) {
    return new Date(value);
  }
  return value;
}

export function parseJson<T>(text: string): T {
  return JSON.parse(text, reviveDates) as T;
}

/** Date.toJSON already yields `toISOString()`, i.e. UTC with `Z`. */
export function toJson(value: unknown) {
  return JSON.stringify(value);
}
