// One id per browser tab, sent as X-Client-Id so realtime events caused by this
// tab can be recognised (their `origin`) and not applied twice.
let clientId: string | null = null;

export function getClientId() {
  if (clientId) return clientId;
  clientId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return clientId;
}
