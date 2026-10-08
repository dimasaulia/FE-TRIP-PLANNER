"use client";

import { useMemo, useState } from "react";
import { useCategoryColors } from "@/features/library/hooks/useCategoryColors";
import { useLibrary } from "@/features/library/hooks/useLibrary";
import { useTripWorkspace } from "@/features/trips/context/TripWorkspaceContext";
import { useTripPermission } from "@/modules/auth/hooks/useTripPermission";
import { usePreferences } from "@/modules/preferences";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { IconButton } from "@/shared/components/IconButton";
import { Spinner } from "@/shared/components/Spinner";
import { cn } from "@/shared/utils/cn";
import type { LibraryKind, LibrarySummary } from "@/types/library.type";
import { LibraryCard } from "./LibraryCard";

type Filter = "all" | LibraryKind;

type LibraryPanelProps = {
  activeItemId: string | null;
  onOpenItem: (itemId: string) => void;
  onNewItem: (kind: LibraryKind) => void;
  renderAction?: (item: LibrarySummary) => React.ReactNode;
  /** Shows a collapse button (desktop sidebar). */
  onCollapse?: () => void;
};

export function LibraryPanel({ activeItemId, onOpenItem, onNewItem, renderAction, onCollapse }: LibraryPanelProps) {
  const { t } = usePreferences();
  const { trip, me } = useTripWorkspace();
  const editable = useTripPermission("content.edit");
  const { data: items = [], isPending, isError, refetch } = useLibrary(trip.id);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const { hueOf } = useCategoryColors(trip.id, items.map((item) => item.category));

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items
      .filter((item) => filter === "all" || item.kind === filter)
      .filter(
        (item) =>
          !query ||
          item.title.toLowerCase().includes(query) ||
          item.location_name?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query),
      )
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }, [filter, items, search]);

  return (
    <section aria-label={t("library.title")} className="flex h-full flex-col">
      <header className="space-y-3 px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">{t("library.heading")}</h2>
          <div className="flex items-center gap-1">
            {editable ? (
              <Button onClick={() => onNewItem(filter === "destination" ? "destination" : "event")} size="sm">
                + {t("library.new")}
              </Button>
            ) : null}
            {onCollapse ? (
              <IconButton className="hidden lg:inline-flex" label={t("library.collapse")} onClick={onCollapse}>
                »
              </IconButton>
            ) : null}
          </div>
        </div>
        <div className="flex rounded-pill bg-sunken p-0.5 text-xs font-semibold" role="tablist">
          {(["all", "event", "destination"] as const).map((option) => (
            <button
              aria-selected={filter === option}
              className={cn(
                "flex-1 rounded-pill px-3 py-1.5 transition-colors",
                filter === option ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink",
              )}
              key={option}
              onClick={() => setFilter(option)}
              role="tab"
              type="button"
            >
              {t(`library.tab.${option}`)}
            </button>
          ))}
        </div>
        <input
          aria-label={t("library.search")}
          className="h-9 w-full rounded-pill border border-line bg-surface px-4 text-sm outline-none placeholder:text-ink-muted focus:border-accent"
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("library.search")}
          type="search"
          value={search}
        />
      </header>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
        {isPending ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : isError ? (
          <EmptyState
            action={
              <Button onClick={() => void refetch()} size="sm" variant="secondary">
                {t("common.retry")}
              </Button>
            }
            title={t("errors.unknown")}
          />
        ) : items.length === 0 ? (
          <EmptyState
            action={
              editable ? (
                <Button onClick={() => onNewItem("event")} size="sm">
                  {t("library.emptyAction")}
                </Button>
              ) : undefined
            }
            description={t("library.emptyHint")}
            title={t("library.emptyTitle")}
          />
        ) : visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">{t("library.noMatch")}</p>
        ) : (
          visible.map((item) => (
            <LibraryCard
              action={renderAction?.(item)}
              active={item.id === activeItemId}
              draggable={editable}
              hue={hueOf(item.category)}
              item={item}
              key={item.id}
              myUserId={me.id}
              onOpen={() => onOpenItem(item.id)}
              timeZone={trip.timezone}
            />
          ))
        )}
      </div>
    </section>
  );
}
