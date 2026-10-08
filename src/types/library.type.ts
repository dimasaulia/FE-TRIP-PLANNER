export type LibraryKind = "destination" | "event";

export type LibrarySummary = {
  id: string;
  trip_id: string;
  kind: LibraryKind;
  title: string;
  location_name: string | null;
  lat: number | null;
  lng: number | null;
  link_url: string | null;
  fixed_start_at: Date | null;
  fixed_end_at: Date | null;
  category: string | null;
  default_duration_min: number;
  banner_url: string | null;
  version: number;
  created_at: Date;
  updated_at: Date;
};

export type LibraryItem = LibrarySummary & {
  description_md: string;
  created_by: string | null;
};

/** Fields a create or patch may carry. */
export type LibraryItemInput = Partial<{
  kind: LibraryKind;
  title: string;
  description_md: string;
  location_name: string | null;
  link_url: string | null;
  fixed_start_at: Date | null;
  fixed_end_at: Date | null;
  category: string | null;
  default_duration_min: number;
  banner_url: string | null;
}>;
