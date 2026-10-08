import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { queryKeys } from "@/config/query-keys.config";
import type { ScheduleBlock } from "@/types/schedule.type";
import type { TripDetail } from "@/types/trip.type";
import { applyRealtimeEvent } from "./realtime-sync.service";

const block = (version: number, start = "2026-12-29T03:00:00Z"): ScheduleBlock => ({
  id: "b1",
  trip_id: "t1",
  library_item_id: null,
  library_item: null,
  title: "Sarapan",
  note: "",
  hue: null,
  start_at: new Date(start),
  end_at: new Date("2026-12-29T04:00:00Z"),
  created_by: "u1",
  updated_by: "u2",
  version,
  created_at: new Date(),
  updated_at: new Date(),
});

const envelope = (type: string, payload: unknown, seq = 1) => ({ v: 1, type, seq, payload });

describe("applyRealtimeEvent", () => {
  it("adds, replaces newer and ignores older block versions", () => {
    const client = new QueryClient();
    client.setQueryData(queryKeys.schedule("t1"), []);

    applyRealtimeEvent(client, "t1", envelope("block.created", block(1)), "me");
    applyRealtimeEvent(client, "t1", envelope("block.updated", block(3, "2026-12-29T02:00:00Z")), "me");
    applyRealtimeEvent(client, "t1", envelope("block.updated", block(2, "2026-12-29T01:00:00Z")), "me");

    const list = client.getQueryData<ScheduleBlock[]>(queryKeys.schedule("t1"))!;
    expect(list).toHaveLength(1);
    expect(list[0].version).toBe(3);
    expect(list[0].start_at.toISOString()).toBe("2026-12-29T02:00:00.000Z");

    applyRealtimeEvent(client, "t1", envelope("block.deleted", block(4)), "me");
    expect(client.getQueryData<ScheduleBlock[]>(queryKeys.schedule("t1"))).toEqual([]);
  });

  it("reports removal of the current user and role changes", () => {
    const client = new QueryClient();
    client.setQueryData<Partial<TripDetail>>(queryKeys.trip("t1"), { my_role: "editor", members: [] });

    const changed = applyRealtimeEvent(
      client,
      "t1",
      envelope("member.changed", { action: "role_changed", user_id: "me", member: { user_id: "me", role: "viewer" } }),
      "me",
    );
    expect(changed).toEqual({ kind: "role_changed", role: "viewer" });
    expect(client.getQueryData<TripDetail>(queryKeys.trip("t1"))?.my_role).toBe("viewer");

    const removed = applyRealtimeEvent(client, "t1", envelope("member.changed", { action: "removed", user_id: "me" }), "me");
    expect(removed.kind).toBe("removed_from_trip");
  });
});
