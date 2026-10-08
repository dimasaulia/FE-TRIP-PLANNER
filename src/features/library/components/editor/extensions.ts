import { Extension, type Editor, type Range } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from "@tiptap/suggestion";

/** Only images served by this app (or a local preview while uploading) render. */
export function isAllowedImageSrc(src: unknown): src is string {
  return typeof src === "string" && (src.startsWith("/api/v1/files/") || src.startsWith("blob:"));
}

const SafeImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        renderHTML: (attributes) => (isAllowedImageSrc(attributes.src) ? { src: attributes.src } : {}),
      },
      uploading: {
        default: null,
        renderHTML: (attributes) => (attributes.uploading ? { "data-uploading": "true" } : {}),
      },
    };
  },
});

export type SlashCommandId =
  | "h1"
  | "h2"
  | "h3"
  | "link"
  | "bullet"
  | "ordered"
  | "task"
  | "quote"
  | "code"
  | "divider"
  | "image";

export const slashCommandIds: SlashCommandId[] = [
  "h1",
  "h2",
  "h3",
  "link",
  "bullet",
  "ordered",
  "task",
  "quote",
  "code",
  "divider",
  "image",
];

/** Bridge between the Suggestion plugin and the React slash menu. */
export type SlashBridge = {
  onChange: (props: SuggestionProps<SlashCommandId> | null) => void;
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
};

function slashExtension(bridge: { current: SlashBridge | null }) {
  return Extension.create({
    name: "slashCommand",
    addProseMirrorPlugins() {
      return [
        Suggestion<SlashCommandId>({
          editor: this.editor,
          char: "/",
          startOfLine: false,
          allowSpaces: false,
          items: () => slashCommandIds,
          command: () => undefined, // the React menu runs commands itself
          render: () => ({
            onStart: (props) => bridge.current?.onChange(props),
            onUpdate: (props) => bridge.current?.onChange(props),
            onKeyDown: (props) => (props.event.key === "Escape" ? (bridge.current?.onChange(null), true) : bridge.current?.onKeyDown(props) ?? false),
            onExit: () => bridge.current?.onChange(null),
          }),
        }),
      ];
    },
  });
}

/** The schema is limited to what the slash menu offers, so Markdown stays clean. */
export function editorExtensions(options: { placeholder?: string; slash?: { current: SlashBridge | null } } = {}) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      underline: false,
      link: { openOnClick: false, autolink: true, protocols: ["http", "https", "mailto"] },
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
    SafeImage.configure({ inline: false, allowBase64: false }),
    Markdown,
    ...(options.placeholder ? [Placeholder.configure({ placeholder: options.placeholder })] : []),
    ...(options.slash ? [slashExtension(options.slash)] : []),
  ];
}

/** Runs a slash command on the typed `/query` range. */
export function runSlashCommand(editor: Editor, range: Range, id: SlashCommandId) {
  const chain = editor.chain().focus().deleteRange(range);
  switch (id) {
    case "h1":
      return chain.setNode("heading", { level: 1 }).run();
    case "h2":
      return chain.setNode("heading", { level: 2 }).run();
    case "h3":
      return chain.setNode("heading", { level: 3 }).run();
    case "bullet":
      return chain.toggleBulletList().run();
    case "ordered":
      return chain.toggleOrderedList().run();
    case "task":
      return chain.toggleTaskList().run();
    case "quote":
      return chain.toggleBlockquote().run();
    case "code":
      return chain.toggleCodeBlock().run();
    case "divider":
      return chain.setHorizontalRule().run();
    case "link":
    case "image":
      return chain.run(); // handled by the editor component (needs input)
  }
}
