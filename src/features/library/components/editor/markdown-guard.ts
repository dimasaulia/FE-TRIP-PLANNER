import { Editor } from "@tiptap/core";
import { editorExtensions } from "./extensions";

/** Normalises Markdown so only real content differences remain. */
export function normalizeMarkdown(markdown: string) {
  return markdown
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) =>
      line
        .replace(/\s+$/g, "")
        .replace(/^(\s*)[*+](\s)/, "$1-$2")
        .replace(/^(\s*)-\s+\[([ xX])\]/, (_m, indent: string, mark: string) => `${indent}- [${mark.toLowerCase()}]`)
        .replace(/__(.+?)__/g, "**$1**")
        .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, "$1_$2_")
        .replace(/[ \t]+/g, " "),
    )
    .join("\n")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}

/** Parses into the editor schema and serialises back. */
export function roundTripMarkdown(markdown: string) {
  const editor = new Editor({ extensions: editorExtensions(), content: markdown, contentType: "markdown" });
  try {
    return editor.getMarkdown();
  } finally {
    editor.destroy();
  }
}

/** True when switching to the visual editor would silently change the text. */
export function wouldLoseContent(markdown: string) {
  if (!markdown.trim()) return false;
  return normalizeMarkdown(roundTripMarkdown(markdown)) !== normalizeMarkdown(markdown);
}
