export type InviteRole = "editor" | "viewer";

export type Invite = {
  id: string;
  role: InviteRole;
  created_by: string;
  created_by_name: string;
  expires_at: Date;
  max_uses: number | null;
  use_count: number;
  created_at: Date;
};

export type CreatedInvite = {
  id: string;
  trip_id: string;
  role: InviteRole;
  expires_at: Date;
  max_uses: number | null;
  use_count: number;
  token: string;
  url: string;
};

export type InvitePreview = {
  trip_name: string;
  role: InviteRole;
  expires_at: Date;
};

export type InviteAccept = {
  trip_id: string;
  role: string;
  joined: boolean;
};
