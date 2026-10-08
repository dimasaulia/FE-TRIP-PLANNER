import type { TranslationKey } from "@/modules/preferences/dictionaries";
import { ApiError } from "./api-error";

const knownCodes = new Set([
  "network_error",
  "unauthorized",
  "forbidden",
  "rate_limited",
  "version_conflict",
  "block_overlap",
  "outside_trip_range",
  "validation_error",
  "library_item_in_use",
  "last_owner",
  "payload_too_large",
  "unsupported_image_type",
  "image_dimensions_exceeded",
  "invalid_image",
  "invite_expired",
  "invite_exhausted",
  "invite_not_found",
  "trip_not_found",
  "library_item_not_found",
  "block_not_found",
  "calendar_not_connected",
  "calendar_reconnect_required",
  "calendar_scope_denied",
  "invalid_time",
  "too_many_connections",
]);

/**
 * Maps a backend error code to a message key; the server `message` is never
 * shown as is.
 */
export function errorMessageKey(error: unknown): TranslationKey {
  if (error instanceof ApiError) {
    if (knownCodes.has(error.code)) return `errors.${error.code}` as TranslationKey;
    if (error.status === 403) return "errors.forbidden";
    if (error.status === 404) return "errors.not_found";
    if (error.status === 413) return "errors.payload_too_large";
    if (error.status === 429) return "errors.rate_limited";
  }
  return "errors.unknown";
}
