import type { LibraryKind } from "./library.type";

export type BlockItemSummary = {
  id: string;
  kind: LibraryKind;
  title: string;
  location_name: string | null;
  category: string | null;
};

export type ScheduleBlock = {
  id: string;
  trip_id: string;
  library_item_id: string | null;
  library_item: BlockItemSummary | null;
  title: string | null;
  note: string;
  /** Colour of a free-text note (0–359); null = neutral. */
  hue: number | null;
  start_at: Date;
  end_at: Date;
  created_by: string | null;
  updated_by: string | null;
  version: number;
  created_at: Date;
  updated_at: Date;
};

export type BlockInput = {
  library_item_id?: string | null;
  title?: string | null;
  note?: string;
  hue?: number | null;
  start_at?: Date;
  end_at?: Date;
};
