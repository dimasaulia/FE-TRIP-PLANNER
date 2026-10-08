import { endpoints } from "@/config/endpoints.config";
import { envConfig } from "@/config/env.config";
import { parseJson } from "@/modules/http/time-codec";
import type { ConnectionStatus, RealtimeEnvelope } from "./realtime.type";

type Handlers = {
  onMessage: (message: RealtimeEnvelope) => void;
  onStatus: (status: ConnectionStatus) => void;
  /** Called after a reconnect: events in between were not replayed. */
  onResync: () => void;
};

const MIN_BACKOFF = 1_000;
const MAX_BACKOFF = 30_000;

function socketUrl(tripId: string) {
  const path = endpoints.trips.ws(tripId);
  if (envConfig.wsUrl) return `${envConfig.wsUrl.replace(/\/$/, "")}${path}`;
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${path}`;
}

/**
 * One WebSocket per open trip. REST stays the only mutation path; this only
 * carries events, presence and drag previews. Reconnects with jittered backoff.
 */
export class RealtimeConnection {
  private socket: WebSocket | null = null;
  private attempt = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private closed = false;
  private everConnected = false;
  private lastSeq: number | null = null;
  /** Last presence message; re-sent after every (re)connect. */
  private presence: string | null = null;

  constructor(
    private readonly tripId: string,
    private readonly handlers: Handlers,
  ) {}

  connect() {
    this.closed = false;
    this.open();
  }

  close() {
    this.closed = true;
    if (this.timer) clearTimeout(this.timer);
    this.socket?.close(1000, "leave");
    this.socket = null;
    this.handlers.onStatus("closed");
  }

  /** Sends when open; previews while offline are dropped, presence is kept. */
  send(type: string, payload: unknown) {
    const data = JSON.stringify({ type, payload });
    if (type === "presence.set") this.presence = data;
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(data);
  }

  get connected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private open() {
    this.handlers.onStatus(this.everConnected ? "reconnecting" : "connecting");
    let socket: WebSocket;
    try {
      socket = new WebSocket(socketUrl(this.tripId));
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.socket = socket;

    socket.onopen = () => {
      this.attempt = 0;
      this.handlers.onStatus("connected");
      if (this.presence) socket.send(this.presence);
    };

    socket.onmessage = (event) => {
      let message: RealtimeEnvelope;
      try {
        message = parseJson<RealtimeEnvelope>(String(event.data));
      } catch {
        return;
      }

      if (message.type === "hello") {
        // A reconnect, or a gap since the last seen seq, means missed events.
        if (this.everConnected && this.lastSeq !== message.seq) this.handlers.onResync();
        this.everConnected = true;
        this.lastSeq = message.seq;
      } else if (this.isCommitted(message.type)) {
        if (this.lastSeq !== null && message.seq > this.lastSeq + 1) this.handlers.onResync();
        this.lastSeq = Math.max(this.lastSeq ?? 0, message.seq);
      }
      this.handlers.onMessage(message);
    };

    socket.onclose = (event) => {
      if (this.socket !== socket) return;
      this.socket = null;
      // 4403/4404-style policy closes (removed from trip) are not retried.
      if (this.closed || event.code === 1008) {
        this.handlers.onStatus("closed");
        return;
      }
      this.scheduleReconnect();
    };
  }

  private isCommitted(type: string) {
    return type !== "presence.update" && type !== "block.preview" && type !== "block.preview_end" && type !== "error";
  }

  private scheduleReconnect() {
    if (this.closed) return;
    this.handlers.onStatus("reconnecting");
    const base = Math.min(MAX_BACKOFF, MIN_BACKOFF * 2 ** this.attempt);
    const delay = base / 2 + Math.random() * (base / 2);
    this.attempt += 1;
    this.timer = setTimeout(() => this.open(), delay);
  }
}
