"use client";

import { useDraggable } from "@dnd-kit/core";
import { useViewersOf } from "@/features/presence/stores/presence.store";
import { usePreferences } from "@/modules/preferences";
import { AvatarStack } from "@/shared/components/Avatar";
import { formatDuration, formatTimeRange } from "@/shared/time";
import { cn } from "@/shared/utils/cn";
import type { LibrarySummary } from "@/types/library.type";
import { CategoryChip } from "./CategoryChip";

export const LIBRARY_DRAG_TYPE = "library-item";

type LibraryCardProps = {
  item: LibrarySummary;
  hue: number | null;
  timeZone: string;
  myUserId: string;
  draggable: boolean;
  active: boolean;
  onOpen: () => void;
  /** Extra action, e.g. "paste to 29 Dec" (rendered by the workspace). */
  action?: React.ReactNode;
};

export function LibraryCard({ item, hue, timeZone, myUserId, draggable, active, onOpen, action }: LibraryCardProps) {
  const { t, locale } = usePreferences();
  const viewers = useViewersOf(item.id, myUserId);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${item.id}`,
    data: { type: LIBRARY_DRAG_TYPE, item },
    disabled: !draggable,
  });

  return (
    <article
      className={cn(
        "group rounded-card border bg-surface p-3 transition-[border-color,box-shadow,opacity]",
        active ? "border-accent shadow-md" : "border-line hover:border-line-strong hover:shadow-sm",
        isDragging && "opacity-40",
      )}
    >
      {item.banner_url ? (
        <div className="mb-2.5 h-28 overflow-hidden rounded-input bg-sunken">
          {/* Always visible; object-cover keeps the ratio (cropped, never stretched). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="size-full object-cover object-center" draggable={false} loading="lazy" src={item.banner_url} />
        </div>
      ) : null}
      <div
        className={cn("flex items-start gap-3", draggable && "cursor-grab touch-none active:cursor-grabbing")}
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        role="button"
        aria-label={t("library.openItem", { title: item.title })}
        aria-roledescription={draggable ? t("library.draggable") : undefined}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter") onOpen();
        }}
        tabIndex={0}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <CategoryChip hue={hue} label={item.category} />
            <span className="rounded-chip bg-sunken px-2 py-0.5 font-mono text-[11px] text-ink-muted">
              {formatDuration(item.default_duration_min, locale)}
            </span>
          </div>
          <h3 className="mt-1.5 truncate font-semibold">{item.title}</h3>
          <p className="truncate text-xs text-ink-muted">
            {item.kind === "event" && item.fixed_start_at && item.fixed_end_at
              ? formatTimeRange(item.fixed_start_at, item.fixed_end_at, timeZone, locale)
              : item.location_name ?? t(`library.kind.${item.kind}`)}
          </p>
        </div>
        {viewers.length ? (
          <AvatarStack
            people={viewers.map((viewer) => ({ id: viewer.user_id, name: viewer.name, avatarUrl: viewer.avatar_url }))}
            size={22}
          />
        ) : null}
      </div>
      {action ? (
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-line pt-2">
          {action}
          {draggable ? <span className="text-[11px] text-ink-muted">{t("library.orDrag")}</span> : null}
        </div>
      ) : null}
    </article>
  );
}

export function LibraryCardOverlay({ item, hue }: { item: LibrarySummary; hue: number | null }) {
  const { locale } = usePreferences();
  return (
    <div className={cn("note note-lifted w-64 rounded-note px-3 py-2", hue === null && "note-neutral")} style={hue === null ? {} : ({ "--note-hue": hue } as React.CSSProperties)}>
      <p className="font-mono text-[10px] uppercase tracking-wider opacity-70">
        {item.category ? `#${item.category} · ` : ""}
        {formatDuration(item.default_duration_min, locale)}
      </p>
      <p className="truncate text-sm font-semibold">{item.title}</p>
    </div>
  );
}
