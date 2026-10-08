export type RealtimeEnvelope<T = unknown> = {
  v: number;
  type: string;
  seq: number;
  origin?: string;
  payload: T;
};

export type Viewing = { type: "library_item"; id: string } | { type: "schedule" } | null;

export type PresenceUser = {
  user_id: string;
  name: string;
  avatar_url: string | null;
  viewing: Viewing;
};

export type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "closed";
