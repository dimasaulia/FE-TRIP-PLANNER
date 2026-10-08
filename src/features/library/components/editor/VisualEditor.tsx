"use client";

import type { SuggestionProps } from "@tiptap/suggestion";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import { useImageUpload } from "@/features/uploads/hooks/useImageUpload";
import { usePreferences } from "@/modules/preferences";
import { cn } from "@/shared/utils/cn";
import { editorExtensions, runSlashCommand, slashCommandIds, type SlashBridge, type SlashCommandId } from "./extensions";
import { hasPendingImages, imageFilesFrom, insertImageFiles } from "./image-insert";
import { SlashMenu, slashLabelKey } from "./SlashMenu";

type VisualEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
  tripId: string;
  editable: boolean;
};

type LinkPrompt = { top: number; left: number; value: string };

export default function VisualEditor({ value, onChange, tripId, editable }: VisualEditorProps) {
  const { t } = usePreferences();
  const { upload } = useImageUpload(tripId);
  const fileInput = useRef<HTMLInputElement>(null);
  // Plain holder read by the Suggestion plugin outside render.
  const [bridge] = useState<{ current: SlashBridge | null }>(() => ({ current: null }));
  const editorRef = useRef<Editor | null>(null);
  const [slash, setSlash] = useState<SuggestionProps<SlashCommandId> | null>(null);
  const [selected, setSelected] = useState(0);
  const [linkPrompt, setLinkPrompt] = useState<LinkPrompt | null>(null);

  const query = slash?.query.toLowerCase() ?? "";
  const items = useMemo(
    () =>
      slashCommandIds.filter(
        (id) => id.startsWith(query) || t(slashLabelKey(id)).toLowerCase().includes(query),
      ),
    [query, t],
  );

  const editor = useEditor({
    extensions: editorExtensions({ placeholder: t("editor.placeholder"), slash: bridge }),
    content: value,
    contentType: "markdown",
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "prose-trip", "aria-label": t("library.description") },
      handleDrop: (view, event) => {
        const files = imageFilesFrom(event.dataTransfer?.files);
        if (!files.length || !editorRef.current) return false;
        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        insertImageFiles(editorRef.current, files, upload, pos);
        return true;
      },
      handlePaste: (_view, event) => {
        const files = imageFilesFrom(event.clipboardData?.files);
        if (!files.length || !editorRef.current) return false;
        insertImageFiles(editorRef.current, files, upload);
        return true;
      },
    },
    onUpdate: ({ editor: current }) => {
      // Never persist blob: previews; the swap to the server URL triggers another update.
      if (hasPendingImages(current)) return;
      onChange(current.getMarkdown());
    },
  });
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const choose = (id: SlashCommandId) => {
    if (!editor || !slash) return;
    const range = slash.range;
    runSlashCommand(editor, range, id);
    setSlash(null);
    if (id === "image") fileInput.current?.click();
    if (id === "link") openLinkPrompt();
  };

  useLayoutEffect(() => {
    bridge.current = {
    onChange: (props) => {
      setSlash(props);
      setSelected(0);
    },
    onKeyDown: ({ event }) => {
      if (!slash) return false;
      if (event.key === "ArrowDown") {
        setSelected((index) => (index + 1) % Math.max(items.length, 1));
        return true;
      }
      if (event.key === "ArrowUp") {
        setSelected((index) => (index - 1 + items.length) % Math.max(items.length, 1));
        return true;
      }
      if (event.key === "Enter") {
        const id = items[selected];
        if (id) choose(id);
        return true;
      }
      return false;
    },
    };
  });

  function openLinkPrompt() {
    if (!editor) return;
    const coords = editor.view.coordsAtPos(editor.state.selection.from);
    const existing = editor.getAttributes("link").href as string | undefined;
    setLinkPrompt({ top: coords.bottom + 6, left: coords.left, value: existing ?? "https://" });
  }

  function applyLink() {
    if (!editor || !linkPrompt) return;
    const href = linkPrompt.value.trim();
    const chain = editor.chain().focus();
    if (!href || href === "https://") chain.extendMarkRange("link").unsetLink().run();
    else if (editor.state.selection.empty) chain.insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
    else chain.extendMarkRange("link").setLink({ href }).run();
    setLinkPrompt(null);
  }

  return (
    <div className="relative">
      <EditorContent editor={editor} />
      {editor && editable ? (
        <BubbleMenu
          className="flex items-center gap-0.5 rounded-pill border border-line bg-surface p-1 shadow-lg"
          editor={editor}
        >
          {(
            [
              ["bold", "B", () => editor.chain().focus().toggleBold().run()],
              ["italic", "I", () => editor.chain().focus().toggleItalic().run()],
              ["strike", "S", () => editor.chain().focus().toggleStrike().run()],
              ["code", "</>", () => editor.chain().focus().toggleCode().run()],
              ["link", "↗", openLinkPrompt],
            ] as const
          ).map(([mark, label, action]) => (
            <button
              aria-label={t(`editor.mark.${mark}`)}
              className={cn(
                "min-w-8 rounded-pill px-2 py-1 font-mono text-xs font-semibold",
                editor.isActive(mark) ? "bg-accent text-on-accent" : "hover:bg-sunken",
              )}
              key={mark}
              onClick={action}
              title={t(`editor.mark.${mark}`)}
              type="button"
            >
              {label}
            </button>
          ))}
        </BubbleMenu>
      ) : null}
      {slash ? (
        <SlashMenu
          items={items}
          onHover={setSelected}
          onSelect={choose}
          rect={slash.clientRect?.() ?? null}
          selected={Math.min(selected, Math.max(items.length - 1, 0))}
        />
      ) : null}
      {linkPrompt ? (
        <form
          className="fixed z-50 flex w-72 gap-2 rounded-card border border-line bg-surface p-2 shadow-xl"
          onSubmit={(event) => {
            event.preventDefault();
            applyLink();
          }}
          style={{ top: linkPrompt.top, left: Math.min(linkPrompt.left, window.innerWidth - 300) }}
        >
          <input
            aria-label={t("editor.linkUrl")}
            autoFocus
            className="h-8 flex-1 rounded-input border border-line-strong bg-surface px-2 text-sm outline-none focus:border-accent"
            onChange={(event) => setLinkPrompt({ ...linkPrompt, value: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Escape") setLinkPrompt(null);
            }}
            type="url"
            value={linkPrompt.value}
          />
          <button className="rounded-pill bg-accent px-3 text-xs font-semibold text-on-accent" type="submit">
            {t("common.ok")}
          </button>
        </form>
      ) : null}
      <input
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        multiple
        onChange={(event) => {
          if (editor) insertImageFiles(editor, imageFilesFrom(event.target.files), upload);
          event.target.value = "";
        }}
        ref={fileInput}
        type="file"
      />
    </div>
  );
}
