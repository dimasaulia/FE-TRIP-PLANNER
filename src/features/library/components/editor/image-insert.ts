import type { Editor } from "@tiptap/core";
import type { UploadResult } from "@/features/uploads/services/upload.service";

type Upload = (file: File, options?: { retry?: () => void }) => Promise<UploadResult | null>;

function findImagePos(editor: Editor, src: string) {
  let found: number | null = null;
  editor.state.doc.descendants((node, pos) => {
    if (found !== null) return false;
    if (node.type.name === "image" && node.attrs.src === src) found = pos;
    return true;
  });
  return found;
}

/**
 * Inserts a temporary image from a local object URL, uploads it, then swaps in
 * the server URL. On failure the temporary node is removed; text is untouched.
 */
export function insertImageFiles(editor: Editor, files: File[], upload: Upload, position?: number) {
  for (const file of files) {
    const previewUrl = URL.createObjectURL(file);
    const content = { type: "image", attrs: { src: previewUrl, alt: file.name.replace(/\.[^.]+$/, ""), uploading: true } };
    if (position !== undefined) editor.chain().insertContentAt(position, content).run();
    else editor.chain().focus().insertContent(content).run();

    const retry = () => insertImageFiles(editor, [file], upload);
    void upload(file, { retry }).then((result) => {
      if (editor.isDestroyed) return;
      const pos = findImagePos(editor, previewUrl);
      if (pos !== null) {
        const tr = editor.state.tr;
        if (result) {
          tr.setNodeMarkup(pos, undefined, {
            ...editor.state.doc.nodeAt(pos)?.attrs,
            src: result.url,
            width: result.width,
            height: result.height,
            uploading: null,
          });
        } else {
          const node = editor.state.doc.nodeAt(pos);
          if (node) tr.delete(pos, pos + node.nodeSize);
        }
        editor.view.dispatch(tr);
      }
      URL.revokeObjectURL(previewUrl);
    });
  }
}

export function imageFilesFrom(list: FileList | null | undefined) {
  return Array.from(list ?? []).filter((file) => file.type.startsWith("image/"));
}

export function hasPendingImages(editor: Editor) {
  let pending = false;
  editor.state.doc.descendants((node) => {
    if (node.type.name === "image" && String(node.attrs.src).startsWith("blob:")) pending = true;
    return !pending;
  });
  return pending;
}
