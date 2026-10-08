"use client";

import { useMemo } from "react";
import { BannerDrop } from "@/features/uploads/components/BannerDrop";
import { useImageUpload } from "@/features/uploads/hooks/useImageUpload";
import { useCategoryColors } from "@/features/library/hooks/useCategoryColors";
import { useLibrary } from "@/features/library/hooks/useLibrary";
import { usePreferences } from "@/modules/preferences";
import { formatDuration, fromLocalInputValue, toLocalInputValue } from "@/shared/time";
import { cn } from "@/shared/utils/cn";
import type { LibraryKind } from "@/types/library.type";
import { CategoryField } from "./CategoryField";
import { DescriptionEditor } from "./editor/DescriptionEditor";
import { InlineText } from "./InlineText";

export type ItemDraft = {
  kind: LibraryKind;
  title: string;
  category: string;
  default_duration_min: number;
  location_name: string;
  link_url: string;
  banner_url: string | null;
  fixed_start_at: Date | null;
  fixed_end_at: Date | null;
  description_md: string;
};

export const DURATIONS = [30, 60, 90, 120, 180, 240];

type ItemFieldsProps = {
  tripId: string;
  timeZone: string;
  draft: ItemDraft;
  editable: boolean;
  autoFocusTitle?: boolean;
  /** Field changed and should be saved (blur, Enter, click). */
  onCommit: (fields: Partial<ItemDraft>) => void;
  /** Title typed (create mode needs it before blur). */
  onTitleDraft?: (title: string) => void;
  headerSlot?: React.ReactNode;
};

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[104px_1fr] items-center gap-3 py-1 text-sm">
      <span className="text-ink-muted">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function ItemFields({ tripId, timeZone, draft, editable, autoFocusTitle, onCommit, onTitleDraft, headerSlot }: ItemFieldsProps) {
  const { t, locale } = usePreferences();
  const { data: library = [] } = useLibrary(tripId);
  const categories = useMemo(
    () => Array.from(new Set(library.map((item) => item.category).filter((value): value is string => Boolean(value)))),
    [library],
  );
  const { hueOf, setHue, usedHues } = useCategoryColors(tripId, [...categories, draft.category]);
  const banner = useImageUpload(tripId);

  return (
    <div className="space-y-5">
      <BannerDrop
        disabled={!editable}
        height={128}
        onFile={async (file) => {
          const result = await banner.upload(file);
          if (result) onCommit({ banner_url: result.url });
        }}
        onRemove={() => onCommit({ banner_url: null })}
        progress={banner.progress}
        uploading={banner.uploading}
        url={banner.previewUrl ?? draft.banner_url}
      />

      <div>
        {headerSlot}
        <InlineText
          ariaLabel={t("library.title")}
          autoFocus={autoFocusTitle}
          className="py-1 text-3xl font-bold tracking-tight"
          editable={editable}
          maxLength={200}
          onCommit={(title) => onCommit({ title })}
          onDraft={onTitleDraft}
          placeholder={t("library.titlePlaceholder")}
          value={draft.title}
        />
      </div>

      <div className="divide-y divide-line rounded-card border border-line px-3 py-1">
        <PropertyRow label={t("library.kind")}>
          <div className="flex gap-1">
            {(["event", "destination"] as const).map((kind) => (
              <button
                className={cn(
                  "rounded-pill px-3 py-1 text-xs font-semibold transition-colors",
                  draft.kind === kind ? "bg-ink text-page" : "bg-sunken text-ink-muted hover:text-ink",
                )}
                disabled={!editable}
                key={kind}
                onClick={() => onCommit({ kind })}
                type="button"
              >
                {t(`library.kind.${kind}`)}
              </button>
            ))}
          </div>
        </PropertyRow>
        <PropertyRow label={t("library.category")}>
          <CategoryField
            disabled={!editable}
            hueOf={hueOf}
            onCommit={(category) => onCommit({ category })}
            onHueChange={setHue}
            suggestions={categories}
            usedHues={usedHues}
            value={draft.category}
          />
        </PropertyRow>
        <PropertyRow label={t("library.duration")}>
          <div className="flex flex-wrap gap-1">
            {DURATIONS.map((minutes) => (
              <button
                className={cn(
                  "rounded-pill px-2.5 py-1 font-mono text-xs transition-colors",
                  draft.default_duration_min === minutes ? "bg-accent text-on-accent" : "bg-sunken text-ink-muted hover:text-ink",
                )}
                disabled={!editable}
                key={minutes}
                onClick={() => onCommit({ default_duration_min: minutes })}
                type="button"
              >
                {formatDuration(minutes, locale)}
              </button>
            ))}
          </div>
        </PropertyRow>
        <PropertyRow label={t("library.location")}>
          <InlineText
            ariaLabel={t("library.location")}
            className="h-8 text-sm"
            editable={editable}
            maxLength={200}
            onCommit={(location_name) => onCommit({ location_name })}
            placeholder={t("library.locationPlaceholder")}
            value={draft.location_name}
          />
        </PropertyRow>
        <PropertyRow label={t("library.link")}>
          <div className="flex items-center gap-2">
            <InlineText
              ariaLabel={t("library.link")}
              className="h-8 text-sm"
              editable={editable}
              onCommit={(link_url) => onCommit({ link_url })}
              placeholder="https://"
              type="url"
              value={draft.link_url}
            />
            {draft.link_url ? (
              <a className="shrink-0 text-xs font-semibold text-accent" href={draft.link_url} rel="noreferrer noopener" target="_blank">
                {t("common.open")} ↗
              </a>
            ) : null}
          </div>
        </PropertyRow>
        {draft.kind === "event" ? (
          <PropertyRow label={t("library.fixedTime")}>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {(["fixed_start_at", "fixed_end_at"] as const).map((field, index) => (
                <span className="flex items-center gap-2" key={field}>
                  {index === 1 ? <span className="text-ink-muted">–</span> : null}
                  <input
                    aria-label={t(index === 0 ? "library.fixedStart" : "library.fixedEnd")}
                    className="h-8 rounded-input bg-sunken px-2 font-mono text-xs outline-none focus:ring-2 focus:ring-accent"
                    disabled={!editable}
                    onChange={(event) => onCommit({ [field]: event.target.value ? fromLocalInputValue(event.target.value, timeZone) : null })}
                    step={300}
                    type="datetime-local"
                    value={draft[field] ? toLocalInputValue(draft[field], timeZone) : ""}
                  />
                </span>
              ))}
            </div>
          </PropertyRow>
        ) : null}
      </div>

      <DescriptionEditor
        editable={editable}
        onChange={(description_md) => onCommit({ description_md })}
        tripId={tripId}
        value={draft.description_md}
      />
    </div>
  );
}
