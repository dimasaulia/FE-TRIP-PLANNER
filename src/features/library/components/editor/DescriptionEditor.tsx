"use client";

import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";
import { usePreferences } from "@/modules/preferences";
import { Button } from "@/shared/components/Button";
import { Dialog } from "@/shared/components/Dialog";
import { Spinner } from "@/shared/components/Spinner";
import { cn } from "@/shared/utils/cn";
import { MarkdownEditor } from "./MarkdownEditor";

// Tiptap and the Markdown tooling only load on the item page.
const VisualEditor = dynamic(() => import("./VisualEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-32 items-center justify-center">
      <Spinner />
    </div>
  ),
});

type Mode = "visual" | "markdown";
const MODE_KEY = "tp:editor-mode";
const modeListeners = new Set<() => void>();

function readMode(): Mode {
  try {
    return window.localStorage.getItem(MODE_KEY) === "markdown" ? "markdown" : "visual";
  } catch {
    return "visual";
  }
}

function storeMode(mode: Mode) {
  try {
    window.localStorage.setItem(MODE_KEY, mode);
  } catch {
    // ignore
  }
  modeListeners.forEach((listener) => listener());
}

type DescriptionEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
  tripId: string;
  editable: boolean;
};

export function DescriptionEditor({ value, onChange, tripId, editable }: DescriptionEditorProps) {
  const { t } = usePreferences();
  const mode = useSyncExternalStore(
    (listener) => {
      modeListeners.add(listener);
      return () => modeListeners.delete(listener);
    },
    readMode,
    () => "visual" as Mode,
  );
  const [checking, setChecking] = useState(false);
  const [lossWarning, setLossWarning] = useState(false);

  async function switchTo(next: Mode) {
    if (next === mode) return;
    if (next === "markdown") {
      storeMode("markdown");
      return;
    }
    // Guard: parse and re-serialise before leaving raw Markdown.
    setChecking(true);
    const { wouldLoseContent } = await import("./markdown-guard");
    setChecking(false);
    if (wouldLoseContent(value)) setLossWarning(true);
    else storeMode("visual");
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{t("library.description")}</h3>
        <div className="flex rounded-pill bg-sunken p-0.5 text-xs font-semibold" role="tablist">
          {(["visual", "markdown"] as const).map((option) => (
            <button
              aria-selected={mode === option}
              className={cn(
                "rounded-pill px-3 py-1 transition-colors",
                mode === option ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink",
              )}
              disabled={checking}
              key={option}
              onClick={() => void switchTo(option)}
              role="tab"
              type="button"
            >
              {t(`editor.mode.${option}`)}
            </button>
          ))}
        </div>
      </div>

      {mode === "visual" ? (
        <VisualEditor editable={editable} onChange={onChange} tripId={tripId} value={value} />
      ) : (
        <MarkdownEditor editable={editable} onChange={onChange} tripId={tripId} value={value} />
      )}

      <Dialog
        description={t("editor.lossWarning.description")}
        onOpenChange={setLossWarning}
        open={lossWarning}
        title={t("editor.lossWarning.title")}
      >
        <div className="flex justify-end gap-2">
          <Button onClick={() => setLossWarning(false)} variant="secondary">
            {t("editor.lossWarning.stay")}
          </Button>
          <Button
            onClick={() => {
              setLossWarning(false);
              storeMode("visual");
            }}
          >
            {t("editor.lossWarning.continue")}
          </Button>
        </div>
      </Dialog>
    </section>
  );
}
