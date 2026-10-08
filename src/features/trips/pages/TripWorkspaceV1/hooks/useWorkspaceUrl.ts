"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { todayKey, type DateKey } from "@/shared/time";
import type { TripDetail } from "@/types/trip.type";

export type WorkspaceView = "schedule" | "library";

/** Selected day, open item and mobile view live in the URL (?day, ?item, ?view). */
export function useWorkspaceUrl(trip: TripDetail) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const today = todayKey(trip.timezone);
  const requested = params.get("day");
  const fallback = today >= trip.start_date && today <= trip.end_date ? today : trip.start_date;
  const day: DateKey =
    requested && requested >= trip.start_date && requested <= trip.end_date ? requested : fallback;
  const item = params.get("item");
  const view: WorkspaceView = params.get("view") === "library" ? "library" : "schedule";

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null) next.delete(key);
        else next.set(key, value);
      }
      const search = next.toString();
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  return {
    day,
    itemId: item && item !== "new" ? item : null,
    composing: item === "new",
    panelOpen: Boolean(item),
    view,
    setDay: (value: DateKey) => update({ day: value }),
    openItem: (id: string) => update({ item: id }),
    newItem: () => update({ item: "new" }),
    closeItem: () => update({ item: null }),
    setView: (value: WorkspaceView) => update({ view: value === "schedule" ? null : value }),
  };
}
