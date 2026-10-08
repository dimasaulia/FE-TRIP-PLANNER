import { cn } from "@/shared/utils/cn";
import { noteStyle } from "@/shared/utils/hue";

type CategoryChipProps = { label: string | null; hue: number | null; className?: string };

export function CategoryChip({ label, hue, className }: CategoryChipProps) {
  if (!label) return null;
  return (
    <span
      className={cn("note-chip inline-flex items-center gap-1 rounded-chip px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide", className)}
      style={noteStyle(hue)}
    >
      #{label}
    </span>
  );
}
