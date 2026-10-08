import { endpoints } from "@/config/endpoints.config";
import { apiClient } from "@/modules/http/api-client";
import type { LibraryItem, LibraryItemInput, LibrarySummary } from "@/types/library.type";

type Page = { items: LibrarySummary[]; next_cursor: string | null };

export const libraryService = {
  /** Loads every page so realtime patches only ever touch one flat list. */
  listAll: async (tripId: string) => {
    const items: LibrarySummary[] = [];
    let cursor: string | null = null;
    do {
      const page: Page = await apiClient<Page>(endpoints.library.list(tripId), { query: { limit: 100, cursor } });
      items.push(...page.items);
      cursor = page.next_cursor;
    } while (cursor);
    return items;
  },
  get: (itemId: string) => apiClient<LibraryItem>(endpoints.library.detail(itemId)),
  create: (tripId: string, input: LibraryItemInput & { kind: LibraryItem["kind"]; title: string }) =>
    apiClient<LibraryItem>(endpoints.library.list(tripId), { method: "POST", body: input }),
  update: (itemId: string, version: number, input: LibraryItemInput) =>
    apiClient<LibraryItem>(endpoints.library.detail(itemId), { method: "PATCH", body: { ...input, version } }),
  remove: (itemId: string, force = false) =>
    apiClient<null>(endpoints.library.detail(itemId), { method: "DELETE", query: { force: force || undefined } }),
};

export function toSummary(item: LibraryItem): LibrarySummary {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { description_md, created_by, ...summary } = item;
  return summary;
}
