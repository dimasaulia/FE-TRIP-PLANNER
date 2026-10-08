"use client";

import { useState } from "react";
import { CategoryChip } from "@/features/library/components/CategoryChip";
import { DescriptionPreview } from "@/features/library/components/editor/DescriptionPreview";
import { useLibraryItem } from "@/features/library/hooks/useLibrary";
import { usePreferences } from "@/modules/preferences";
import { Button } from "@/shared/components/Button";
import { Field, TextArea, TextInput } from "@/shared/components/Field";
import { HuePicker } from "@/shared/components/HuePicker";
import { Spinner } from "@/shared/components/Spinner";
import { formatTimeRange } from "@/shared/time";
import type { ScheduleBlock } from "@/types/schedule.type";

type BlockDetailProps = {
  block: ScheduleBlock;
  timeZone: string;
  editable: boolean;
  hue: number | null;
  onSave: (input: { title?: string | null; note?: string; hue?: number | null }) => void;
  onDelete: () => void;
  onOpenItem: (itemId: string) => void;
};

/** Event/place details (banner, properties, description) plus the block's own fields. */
function ItemDetails({ itemId, tripId, timeZone, hue }: { itemId: string; tripId: string; timeZone: string; hue: number | null }) {
  const { t, locale } = usePreferences();
  const { data: item, isPending } = useLibraryItem(itemId);
  if (isPending) return <Spinner />;
  if (!item) return null;

  return (
    <div className="space-y-3">
      {item.banner_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="h-36 w-full rounded-input bg-sunken object-cover" loading="lazy" src={item.banner_url} />
      ) : null}
      <div className="flex flex-wrap items-center gap-1.5">
        <CategoryChip hue={hue} label={item.category} />
        <span className="rounded-chip bg-sunken px-2 py-0.5 text-[11px] text-ink-muted">{t(`library.kind.${item.kind}`)}</span>
      </div>
      <h3 className="text-lg font-bold leading-tight">{item.title}</h3>
      <dl className="grid grid-cols-[80px_1fr] gap-y-1 text-xs">
        {item.location_name ? (
          <>
            <dt className="text-ink-muted">{t("library.location")}</dt>
            <dd>{item.location_name}</dd>
          </>
        ) : null}
        {item.link_url ? (
          <>
            <dt className="text-ink-muted">{t("library.link")}</dt>
            <dd className="truncate">
              <a className="text-accent underline" href={item.link_url} rel="noreferrer noopener" target="_blank">
                {item.link_url}
              </a>
            </dd>
          </>
        ) : null}
        {item.fixed_start_at && item.fixed_end_at ? (
          <>
            <dt className="text-ink-muted">{t("library.fixedTime")}</dt>
            <dd className="font-mono">{formatTimeRange(item.fixed_start_at, item.fixed_end_at, timeZone, locale)}</dd>
          </>
        ) : null}
      </dl>
      <DescriptionPreview markdown={item.description_md} tripId={tripId} />
    </div>
  );
}

export function BlockDetail({ block, timeZone, editable, hue, onSave, onDelete, onOpenItem }: BlockDetailProps) {
  const { t, locale } = usePreferences();
  const [title, setTitle] = useState(block.title ?? "");
  const [note, setNote] = useState(block.note);
  const fallbackTitle = block.library_item?.title ?? "";

  const save = () => {
    const nextTitle = title.trim() ? title.trim() : null;
    // A free-text block always needs a title.
    if (!block.library_item_id && !nextTitle) return;
    if (nextTitle !== block.title || note !== block.note) onSave({ title: nextTitle, note });
  };

  return (
    <div className="space-y-3">
      <p className="font-mono text-xs text-ink-muted">{formatTimeRange(block.start_at, block.end_at, timeZone, locale)}</p>
      {block.library_item_id ? (
        <ItemDetails hue={hue} itemId={block.library_item_id} timeZone={timeZone} tripId={block.trip_id} />
      ) : null}
      <div className="space-y-3 border-t border-line pt-3">
        <Field hint={block.library_item ? t("schedule.titleOverrideHint") : undefined} label={t("schedule.title")}>
          <TextInput
            disabled={!editable}
            onBlur={save}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            placeholder={fallbackTitle}
            value={title}
          />
        </Field>
        <Field label={t("schedule.note")}>
          <TextArea disabled={!editable} onBlur={save} onChange={(event) => setNote(event.target.value)} rows={3} value={note} />
        </Field>
        {!block.library_item_id ? (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">{t("schedule.color")}</p>
            <HuePicker
              disabled={!editable}
              neutralLabel={t("schedule.colorNeutral")}
              onChange={(next) => {
                if (next !== block.hue) onSave({ hue: next });
              }}
              value={block.hue}
            />
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {block.library_item_id ? (
          <Button onClick={() => onOpenItem(block.library_item_id!)} size="sm" variant="secondary">
            {t("schedule.openItem")}
          </Button>
        ) : (
          <span />
        )}
        {editable ? (
          <Button onClick={onDelete} size="sm" variant="danger">
            {t("common.delete")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
