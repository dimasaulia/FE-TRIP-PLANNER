export const queryKeys = {
  me: ["me"] as const,
  trips: ["trips"] as const,
  trip: (tripId: string) => ["trip", tripId] as const,
  library: (tripId: string) => ["library", tripId] as const,
  libraryItem: (itemId: string) => ["library-item", itemId] as const,
  schedule: (tripId: string) => ["schedule", tripId] as const,
  invites: (tripId: string) => ["invites", tripId] as const,
  invitePreview: (token: string) => ["invite-preview", token] as const,
};
