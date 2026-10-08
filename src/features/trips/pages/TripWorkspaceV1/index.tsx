"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";
import { LibraryCardOverlay, LIBRARY_DRAG_TYPE } from "@/features/library/components/LibraryCard";
import { LibraryItemPanel } from "@/features/library/components/LibraryItemPanel";
import { LibraryPanel } from "@/features/library/components/LibraryPanel";
import { useCategoryColors } from "@/features/library/hooks/useCategoryColors";
import { useItemPanelMode } from "@/features/library/hooks/useItemPanelMode";
import { useLibraryCollapsed } from "@/features/library/hooks/useLibraryCollapsed";
import { AddToSchedulePopover } from "@/features/schedule/components/AddToSchedulePopover";
import { DayStrip } from "@/features/schedule/components/DayStrip";
import { ScheduleTimeline, TIMELINE_DROP_ID, type TimelineHandle } from "@/features/schedule/components/ScheduleTimeline";
import { useTripWorkspace } from "@/features/trips/context/TripWorkspaceContext";
import { useTripPermission } from "@/modules/auth/hooks/useTripPermission";
import { usePreferences } from "@/modules/preferences";
import { formatDateKey } from "@/shared/time";
import { cn } from "@/shared/utils/cn";
import type { LibraryKind, LibrarySummary } from "@/types/library.type";
import { useWorkspaceUrl } from "./hooks/useWorkspaceUrl";

function pointerY(event: DragMoveEvent | DragEndEvent) {
  const activator = event.activatorEvent as PointerEvent | TouchEvent;
  const startY = "touches" in activator ? (activator.touches[0]?.clientY ?? 0) : activator.clientY;
  return startY + event.delta.y;
}

function dragItem(event: { active: { data: { current?: unknown } } }) {
  const data = event.active.data.current as { type?: string; item?: LibrarySummary } | undefined;
  return data?.type === LIBRARY_DRAG_TYPE ? (data.item ?? null) : null;
}

/** Library and schedule side by side so dragging between them is direct. */
export function TripWorkspaceV1() {
  const { t, locale } = usePreferences();
  const { trip, send } = useTripWorkspace();
  const editable = useTripPermission("content.edit");
  const url = useWorkspaceUrl(trip);
  const timeline = useRef<TimelineHandle>(null);
  const [dragging, setDragging] = useState<LibrarySummary | null>(null);
  const [newKind, setNewKind] = useState<LibraryKind>("event");
  const { hueOf } = useCategoryColors(trip.id);
  const [panelMode] = useItemPanelMode();
  const [libraryCollapsed, setLibraryCollapsed] = useLibraryCollapsed();
  // An item opened as a side panel lives in the library column, so it unfolds.
  const collapsed = libraryCollapsed && !(url.panelOpen && panelMode === "panel");

  // Pop-up and full screen close with Escape, like a dialog.
  useEffect(() => {
    if (!url.panelOpen || panelMode === "panel") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !(event.target as HTMLElement | null)?.closest?.(".ProseMirror, input, textarea")) url.closeItem();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelMode, url]);

  // Mouse drags after 4px; touch needs a long press so it never fights scrolling.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
  );

  useEffect(() => {
    send("presence.set", { viewing: { type: "schedule" } });
  }, [send]);

  const dayLabel = formatDateKey(url.day, locale, { day: "numeric", month: "short" });

  return (
    <DndContext
      onDragCancel={() => {
        setDragging(null);
        timeline.current?.leave();
      }}
      onDragEnd={(event: DragEndEvent) => {
        const item = dragItem(event);
        setDragging(null);
        if (item && event.over?.id === TIMELINE_DROP_ID) timeline.current?.drop(pointerY(event), item);
        else timeline.current?.leave();
      }}
      onDragMove={(event: DragMoveEvent) => {
        const item = dragItem(event);
        if (item && event.over?.id === TIMELINE_DROP_ID) timeline.current?.hover(pointerY(event), item);
        else timeline.current?.leave();
      }}
      onDragStart={(event: DragStartEvent) => setDragging(dragItem(event))}
      sensors={sensors}
    >
      <div
        className={cn(
          "grid h-full grid-cols-1 transition-[grid-template-columns] duration-(--motion-base)",
          collapsed ? "lg:grid-cols-[minmax(0,1fr)_56px]" : "lg:grid-cols-[minmax(0,1fr)_400px]",
        )}
        style={{ "--library-width": collapsed ? "56px" : "400px" } as React.CSSProperties}
      >
        <section
          aria-label={t("schedule.heading")}
          className={cn("min-h-0 flex-col overflow-hidden", url.view === "schedule" ? "flex" : "hidden lg:flex")}
        >
          <div className="border-b border-line px-4 py-3 sm:px-6">
            <DayStrip onSelect={url.setDay} selected={url.day} />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-24 pt-5 sm:px-6" data-timeline-scroll>
            <ScheduleTimeline dayKey={url.day} onDayChange={url.setDay} onOpenItem={url.openItem} ref={timeline} />
          </div>
        </section>

        <aside
          className={cn(
            "relative min-h-0 border-line bg-paper lg:border-l",
            // Opening an item from the timeline on a phone still needs this subtree.
            url.view === "library" || url.panelOpen ? "block" : "hidden lg:block",
          )}
        >
          {collapsed ? (
            <button
              aria-label={t("library.expand")}
              className="hidden h-full w-full flex-col items-center gap-4 pt-5 text-ink-muted hover:bg-sunken hover:text-ink lg:flex"
              onClick={() => setLibraryCollapsed(false)}
              title={t("library.expand")}
              type="button"
            >
              <span className="text-lg">«</span>
              <span className="font-mono text-xs uppercase tracking-widest [writing-mode:vertical-rl]">{t("library.heading")}</span>
            </button>
          ) : null}
          <div className={cn("h-full", collapsed && "lg:hidden")}>
            <LibraryPanel
              onCollapse={() => setLibraryCollapsed(true)}
              activeItemId={url.itemId}
              onNewItem={(kind) => {
                setNewKind(kind);
                url.newItem();
              }}
              onOpenItem={url.openItem}
              renderAction={
                editable
                  ? (item) => (
                      <AddToSchedulePopover
                        day={url.day}
                        item={item}
                        onPlace={(day, minutes) => timeline.current?.placeAt(day, minutes, item) ?? false}
                        trigger={
                          <button className="rounded-pill bg-sunken px-3 py-1 text-xs font-semibold hover:bg-sunken-strong" type="button">
                            {t("library.pasteTo", { day: dayLabel })}
                          </button>
                        }
                      />
                    )
                  : undefined
              }
            />
          </div>
          {url.panelOpen ? (
            <div
              className={cn(
                "fixed inset-0 z-30",
                panelMode === "panel" && "lg:absolute lg:inset-0 lg:z-10 lg:shadow-2xl",
                panelMode === "popup" && "lg:z-40 lg:flex lg:items-center lg:justify-center lg:bg-ink/40 lg:p-6 lg:backdrop-blur-[2px]",
                panelMode === "full" && "lg:z-40",
              )}
              onClick={(event) => {
                if (panelMode === "popup" && event.target === event.currentTarget) url.closeItem();
              }}
            >
              <div
                className={cn(
                  "h-full w-full",
                  panelMode === "popup" && "lg:h-[88vh] lg:max-w-4xl lg:overflow-hidden lg:rounded-panel lg:shadow-2xl",
                )}
                role={panelMode === "panel" ? undefined : "dialog"}
                aria-modal={panelMode === "panel" ? undefined : true}
              >
                <LibraryItemPanel
                  defaultKind={newKind}
                  itemId={url.itemId}
                  key={url.itemId ?? "new"}
                  onClose={url.closeItem}
                  onCreated={url.openItem}
                  tripId={trip.id}
                />
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      <nav className="fixed inset-x-4 bottom-4 z-20 flex rounded-pill bg-ink p-1 text-sm font-semibold text-page shadow-xl lg:hidden">
        {(["schedule", "library"] as const).map((view) => (
          <button
            aria-pressed={url.view === view}
            className={cn("flex-1 rounded-pill py-2", url.view === view ? "bg-page text-ink" : "")}
            key={view}
            onClick={() => url.setView(view)}
            type="button"
          >
            {t(view === "schedule" ? "schedule.heading" : "library.heading")}
          </button>
        ))}
      </nav>

      <DragOverlay dropAnimation={null}>
        {dragging ? <LibraryCardOverlay hue={hueOf(dragging.category)} item={dragging} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
