"use client";

import { useRef } from "react";
import { useImageUpload } from "@/features/uploads/hooks/useImageUpload";
import { usePreferences } from "@/modules/preferences";
import { imageFilesFrom } from "./image-insert";

type MarkdownEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
  tripId: string;
  editable: boolean;
};

/** Raw Markdown, monospace, full width; dropped or pasted images become `![](url)`. */
export function MarkdownEditor({ value, onChange, tripId, editable }: MarkdownEditorProps) {
  const { t } = usePreferences();
  const { upload, uploading } = useImageUpload(tripId);
  const area = useRef<HTMLTextAreaElement>(null);
  const latest = useRef(value);
  latest.current = value;

  async function insertImages(files: File[]) {
    for (const file of files) {
      const result = await upload(file, { retry: () => void insertImages([file]) });
      if (!result) continue;
      const element = area.current;
      const text = latest.current;
      const at = element ? element.selectionStart : text.length;
      const snippet = `![](${result.url})`;
      onChange(`${text.slice(0, at)}${snippet}${text.slice(at)}`);
    }
  }

  return (
    <div className="relative">
      <textarea
        aria-label={t("library.description")}
        className="min-h-64 w-full resize-y rounded-input border border-line bg-sunken/50 p-3 font-mono text-sm leading-6 outline-none focus:border-accent"
        onChange={(event) => onChange(event.target.value)}
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes("Files")) event.preventDefault();
        }}
        onDrop={(event) => {
          const files = imageFilesFrom(event.dataTransfer.files);
          if (!files.length) return;
          event.preventDefault();
          void insertImages(files);
        }}
        onPaste={(event) => {
          const files = imageFilesFrom(event.clipboardData.files);
          if (!files.length) return;
          event.preventDefault();
          void insertImages(files);
        }}
        placeholder={t("editor.markdownPlaceholder")}
        readOnly={!editable}
        ref={area}
        spellCheck={false}
        value={value}
      />
      {uploading ? <span className="absolute right-3 top-3 text-xs text-ink-muted">{t("upload.uploading")}</span> : null}
    </div>
  );
}
