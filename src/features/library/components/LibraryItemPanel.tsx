"use client";

import { useEffect, useState } from "react";
import { useTripWorkspace } from "@/features/trips/context/TripWorkspaceContext";
import { useViewersOf } from "@/features/presence/stores/presence.store";
import { localBackups, useItemAutosave, type SaveStatus } from "@/features/library/hooks/useItemAutosave";
import { useCreateLibraryItem, useDeleteLibraryItem, useLibraryItem } from "@/features/library/hooks/useLibrary";
import { useTripPermission } from "@/modules/auth/hooks/useTripPermission";
import { isApiError } from "@/modules/http/api-error";
import { usePreferences } from "@/modules/preferences";
import { AvatarStack } from "@/shared/components/Avatar";
import { Button } from "@/shared/components/Button";
import { Dialog } from "@/shared/components/Dialog";
import { IconButton } from "@/shared/components/IconButton";
import { Spinner } from "@/shared/components/Spinner";
import { toast } from "@/shared/components/Toast";
import type { LibraryItem, LibraryItemInput, LibraryKind } from "@/types/library.type";
import { cn } from "@/shared/utils/cn";
import { useItemPanelMode, type ItemPanelMode } from "@/features/library/hooks/useItemPanelMode";
import { ItemFields, type ItemDraft } from "./ItemFields";

type LibraryItemPanelProps = {
  tripId: string;
  /** null opens the composer for a new item. */
  itemId: string | null;
  defaultKind: LibraryKind;
  onClose: () => void;
  onCreated: (itemId: string) => void;
};

function draftFrom(item: LibraryItem): ItemDraft {
  return {
    kind: item.kind,
    title: item.title,
    category: item.category ?? "",
    default_duration_min: item.default_duration_min,
    location_name: item.location_name ?? "",
    link_url: item.link_url ?? "",
    banner_url: item.banner_url,
    fixed_start_at: item.fixed_start_at,
    fixed_end_at: item.fixed_end_at,
    description_md: item.description_md,
  };
}

/** UI draft → API fields: empty optional text becomes null. */
function toInput(fields: Partial<ItemDraft>): LibraryItemInput {
  const input: LibraryItemInput = {};
  for (const [key, value] of Object.entries(fields) as Array<[keyof ItemDraft, ItemDraft[keyof ItemDraft]]>) {
    if (key === "category" || key === "location_name" || key === "link_url") {
      const text = String(value ?? "").trim();
      input[key] = text ? text : null;
    } else {
      (input as Record<string, unknown>)[key] = value;
    }
  }
  return input;
}

const modeIcons: Record<ItemPanelMode, string> = { panel: "◧", popup: "❐", full: "⤢" };

function ModeSwitch() {
  const { t } = usePreferences();
  const [mode, setMode] = useItemPanelMode();
  return (
    <div className="hidden items-center rounded-pill bg-sunken p-0.5 lg:flex" role="radiogroup" aria-label={t("library.mode.label")}>
      {(["panel", "popup", "full"] as const).map((option) => (
        <button
          aria-checked={mode === option}
          aria-label={t(`library.mode.${option}`)}
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-pill text-sm transition-colors",
            mode === option ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink",
          )}
          key={option}
          onClick={() => setMode(option)}
          role="radio"
          title={t(`library.mode.${option}`)}
          type="button"
        >
          {modeIcons[option]}
        </button>
      ))}
    </div>
  );
}

function PanelShell({ title, onClose, children, aside }: { title: string; onClose: () => void; children: React.ReactNode; aside?: React.ReactNode }) {
  const { t } = usePreferences();
  const [mode] = useItemPanelMode();
  return (
    <section aria-label={title} className="flex h-full flex-col bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">{title}</p>
        <div className="flex items-center gap-2">
          {aside}
          <ModeSwitch />
          <IconButton label={t("common.close")} onClick={onClose}>
            ✕
          </IconButton>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Wider modes keep a readable writing column. */}
        <div className={cn(mode !== "panel" && "mx-auto max-w-3xl lg:py-4")}>{children}</div>
      </div>
    </section>
  );
}

function SaveIndicator({ status, onRetry }: { status: SaveStatus; onRetry: () => void }) {
  const { t } = usePreferences();
  if (status === "idle") return null;
  if (status === "error") {
    return (
      <span className="flex items-center gap-2 text-xs text-danger">
        {t("library.save.error")}
        <button className="font-semibold underline" onClick={onRetry} type="button">
          {t("common.retry")}
        </button>
      </span>
    );
  }
  const label = status === "saving" || status === "dirty" ? t("library.save.saving") : status === "saved" ? t("library.save.saved") : t("library.save.conflict");
  return (
    <span aria-live="polite" className="text-xs text-ink-muted">
      {label}
    </span>
  );
}

function CreateItem({ tripId, defaultKind, onClose, onCreated }: Omit<LibraryItemPanelProps, "itemId">) {
  const { t } = usePreferences();
  const { trip } = useTripWorkspace();
  const create = useCreateLibraryItem(tripId);
  const [draft, setDraft] = useState<ItemDraft>({
    kind: defaultKind,
    title: "",
    category: "",
    default_duration_min: 60,
    location_name: "",
    link_url: "",
    banner_url: null,
    fixed_start_at: null,
    fixed_end_at: null,
    description_md: "",
  });

  // Sent only once the title is filled and focus leaves it, so empty drafts
  // never reach other members through `library.created`.
  function submit(next: ItemDraft) {
    if (!next.title.trim() || create.isPending) return;
    const input = toInput(next);
    create.mutate(
      { ...input, kind: next.kind, title: next.title.trim() },
      { onSuccess: (item) => onCreated(item.id) },
    );
  }

  return (
    <PanelShell aside={create.isPending ? <Spinner /> : null} onClose={onClose} title={t("library.newTitle")}>
      <ItemFields
        autoFocusTitle
        draft={draft}
        editable
        onCommit={(fields) => {
          const next = { ...draft, ...fields };
          setDraft(next);
          if ("title" in fields) submit(next);
        }}
        timeZone={trip.timezone}
        tripId={tripId}
      />
      <p className="mt-4 text-xs text-ink-muted">{t("library.createHint")}</p>
    </PanelShell>
  );
}

function EditItem({ item, tripId, onClose }: { item: LibraryItem; tripId: string; onClose: () => void }) {
  const { t } = usePreferences();
  const { trip, me, send } = useTripWorkspace();
  const editable = useTripPermission("content.edit");
  const autosave = useItemAutosave(item, tripId);
  const remove = useDeleteLibraryItem(tripId);
  const viewers = useViewersOf(item.id, me.id);
  const [draft, setDraft] = useState(() => draftFrom(item));
  const [confirmDelete, setConfirmDelete] = useState<null | { blocks: number }>(null);
  const [resetKey, setResetKey] = useState(autosave.resetKey);

  // After "load latest" the server copy replaces local state.
  if (resetKey !== autosave.resetKey) {
    setResetKey(autosave.resetKey);
    setDraft(draftFrom(item));
  }

  useEffect(() => {
    send("presence.set", { viewing: { type: "library_item", id: item.id } });
    return () => send("presence.set", { viewing: { type: "schedule" } });
  }, [item.id, send]);

  function deleteItem(force: boolean) {
    remove.mutate(
      { itemId: item.id, force },
      {
        onSuccess: () => {
          setConfirmDelete(null);
          onClose();
        },
        onError: (error) => {
          if (isApiError(error, "library_item_in_use")) setConfirmDelete({ blocks: Number(error.details.block_count ?? 1) });
          else toast({ message: t("errors.unknown"), tone: "error" });
        },
      },
    );
  }

  const backup = localBackups.get(item.id);

  return (
    <PanelShell
      aside={
        <>
          <AvatarStack people={viewers.map((viewer) => ({ id: viewer.user_id, name: viewer.name, avatarUrl: viewer.avatar_url, online: true }))} size={24} />
          <SaveIndicator onRetry={() => void autosave.retry()} status={autosave.status} />
        </>
      }
      onClose={onClose}
      title={t(`library.kind.${item.kind}`)}
    >
      {autosave.conflict ? (
        <div className="sticky top-0 z-10 mb-4 rounded-card border border-line-strong bg-sunken p-3 text-sm shadow-lg" role="alert">
          <p className="font-semibold">{t("library.conflict.title")}</p>
          <p className="mt-1 text-ink-muted">{t("library.conflict.description")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={autosave.reloadLatest} size="sm">
              {t("library.conflict.reload")}
            </Button>
            <Button onClick={autosave.overwrite} size="sm" variant="secondary">
              {t("library.conflict.overwrite")}
            </Button>
          </div>
        </div>
      ) : null}
      {backup && Object.keys(backup).length ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-card bg-sunken p-3 text-xs">
          <span>{t("library.conflict.backup")}</span>
          <button
            className="font-semibold underline"
            onClick={() => {
              void navigator.clipboard?.writeText(backup.description_md ?? JSON.stringify(backup, null, 2));
              localBackups.delete(item.id);
              toast({ message: t("library.conflict.copied") });
            }}
            type="button"
          >
            {t("library.conflict.copy")}
          </button>
        </div>
      ) : null}

      <ItemFields
        draft={draft}
        editable={editable}
        key={autosave.resetKey}
        onCommit={(fields) => {
          if ("title" in fields && !String(fields.title).trim()) return;
          setDraft((current) => ({ ...current, ...fields }));
          autosave.queue(toInput(fields));
        }}
        timeZone={trip.timezone}
        tripId={tripId}
      />

      {editable ? (
        <div className="mt-8 border-t border-line pt-4">
          <Button disabled={remove.isPending} onClick={() => deleteItem(false)} size="sm" variant="danger">
            {t("library.delete")}
          </Button>
        </div>
      ) : null}

      <Dialog
        description={t("library.deleteInUse", { count: confirmDelete?.blocks ?? 0 })}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        open={Boolean(confirmDelete)}
        title={t("library.delete")}
      >
        <div className="flex justify-end gap-2">
          <Button onClick={() => setConfirmDelete(null)} variant="secondary">
            {t("common.cancel")}
          </Button>
          <Button onClick={() => deleteItem(true)} variant="danger">
            {t("library.deleteAll")}
          </Button>
        </div>
      </Dialog>
    </PanelShell>
  );
}

export function LibraryItemPanel(props: LibraryItemPanelProps) {
  const { t } = usePreferences();
  const query = useLibraryItem(props.itemId);

  if (!props.itemId) return <CreateItem {...props} />;
  if (query.isPending) {
    return (
      <PanelShell onClose={props.onClose} title={t("library.loading")}>
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      </PanelShell>
    );
  }
  if (query.isError || !query.data) {
    return (
      <PanelShell onClose={props.onClose} title={t("errors.not_found")}>
        <p className="text-sm text-ink-muted">{t("library.notFound")}</p>
      </PanelShell>
    );
  }
  return <EditItem item={query.data} key={query.data.id} onClose={props.onClose} tripId={props.tripId} />;
}
