"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/shared/components/Spinner";

// Read-only render through the same schema as the editor (no raw HTML).
const VisualEditor = dynamic(() => import("./VisualEditor"), {
  ssr: false,
  loading: () => <Spinner />,
});

const noop = () => undefined;

export function DescriptionPreview({ markdown, tripId }: { markdown: string; tripId: string }) {
  if (!markdown.trim()) return null;
  return (
    <div className="text-sm [&_.ProseMirror]:min-h-0">
      <VisualEditor editable={false} onChange={noop} tripId={tripId} value={markdown} />
    </div>
  );
}
