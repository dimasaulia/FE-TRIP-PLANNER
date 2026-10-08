"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePreferences } from "@/modules/preferences";
import { cn } from "@/shared/utils/cn";

type BannerDropProps = {
  /** Saved banner URL (served with the session cookie, so a plain img). */
  url: string | null;
  /** Locally chosen file not uploaded yet (create trip form). */
  file?: File | null;
  uploading?: boolean;
  progress?: number;
  disabled?: boolean;
  height?: number;
  onFile: (file: File) => void;
  onRemove?: () => void;
};

export function BannerDrop({ url, file, uploading, progress = 0, disabled, height = 140, onFile, onRemove }: BannerDropProps) {
  const { t } = usePreferences();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const localUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => () => {
    if (localUrl) URL.revokeObjectURL(localUrl);
  }, [localUrl]);

  const shown = localUrl ?? url;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-card border border-dashed transition-colors",
        over ? "border-accent bg-accent-soft" : "border-line-strong bg-sunken",
        disabled && "pointer-events-none",
      )}
      onDragLeave={() => setOver(false)}
      onDragOver={(event) => {
        if (disabled || !event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        setOver(true);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const dropped = event.dataTransfer.files[0];
        if (dropped) onFile(dropped);
      }}
      style={{ height }}
    >
      {shown ? (
        // Images need the session cookie, so next/image's optimizer cannot fetch them.
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="size-full object-cover" loading="lazy" src={shown} />
      ) : null}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center gap-2 text-sm font-medium",
          shown ? "bg-ink/40 text-page opacity-0 transition-opacity group-hover:opacity-100" : "text-ink-muted",
        )}
      >
        {!disabled ? (
          <button className="rounded-pill bg-surface/90 px-3 py-1.5 text-ink" onClick={() => input.current?.click()} type="button">
            {shown ? t("upload.changeBanner") : t("upload.dropBanner")}
          </button>
        ) : null}
        {shown && onRemove && !disabled ? (
          <button className="rounded-pill bg-surface/90 px-3 py-1.5 text-ink" onClick={onRemove} type="button">
            {t("common.remove")}
          </button>
        ) : null}
      </div>
      {uploading ? (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-line">
          <div className="h-full bg-accent transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      ) : null}
      <input
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const chosen = event.target.files?.[0];
          if (chosen) onFile(chosen);
          event.target.value = "";
        }}
        ref={input}
        type="file"
      />
    </div>
  );
}
