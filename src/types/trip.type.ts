// API shapes after the http module converted every `*_at` string into a Date.

export type Role = "owner" | "editor" | "viewer";

export type User = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
};

export type CalendarConnectionStatus = {
  connected: boolean;
  status: "not_connected" | "active" | "revoked";
  google_email: string | null;
};

export type Me = {
  user: User;
  calendar: CalendarConnectionStatus;
};

export type Trip = {
  id: string;
  name: string;
  description: string;
  /** `YYYY-MM-DD` in the trip timezone; never turned into a local Date. */
  start_date: string;
  end_date: string;
  timezone: string;
  banner_url: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  my_role: Role;
};

export type TripListItem = Trip & { member_count: number };

export type TripMember = {
  trip_id: string;
  user_id: string;
  role: Role;
  joined_at: Date;
  name: string;
  email: string;
  avatar_url: string | null;
};

export type CalendarSyncStatus = {
  enabled: boolean;
  last_synced_at: Date | null;
  last_error: string | null;
  pending_jobs: number;
};

export type TripDetail = Trip & {
  members: TripMember[];
  calendar_sync: CalendarSyncStatus;
};

export type MemberChange = {
  action: "added" | "role_changed" | "removed";
  user_id: string;
  member?: TripMember;
};
