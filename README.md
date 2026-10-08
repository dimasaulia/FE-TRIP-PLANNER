# Trip Planner Frontend

Next.js (App Router, TypeScript strict) frontend for the collaborative trip timeline planner, implementing the TRD "Frontend – Trip Timeline Planner" on top of the OpenSuite boilerplate. Read `AGENTS.md` for the architecture rules (routing-only `src/app`, versioned feature pages, hooks → services → `modules/http`).

## Run

```bash
cp .env.example .env.local      # BACKEND_URL, NEXT_PUBLIC_WS_URL, NEXT_PUBLIC_DEV_LOGIN_ENABLED
npm install
npm run dev                     # http://localhost:3000
```

The backend must allow this origin and redirect back to it: in `BE/.env` set `APP_BASE_URL=http://localhost:3000` and add `http://localhost:3000` to `ALLOWED_ORIGINS`. `/api/*` is rewritten to `BACKEND_URL` (same origin, so the session cookie travels); the WebSocket cannot pass through rewrites and uses `NEXT_PUBLIC_WS_URL` directly.

Checks:

```bash
npm run lint
npm run test        # vitest: time/DST, gaps, realtime cache patches, markdown guard, token contrast, i18n keys
npm run build
npm run tokens      # regenerate src/styles/theme.css after editing src/styles/tokens.ts
```

## Routes

| Route | Page |
| --- | --- |
| `/login` | `LoginV1` – Google sign-in (+ dev login when enabled) |
| `/join/[token]` | `JoinV1` – invite preview and join |
| `/trips` | `TripListV1` – trips, create trip with banner; one trip opens directly (`?all=1` shows the list) |
| `/trips/[tripId]` | `TripWorkspaceV1` – day strip, timeline and library side by side (`?day`, `?item`, `?view` on phones) |
| `/trips/[tripId]/settings` | `TripSettingsV1` – details, members, invites, Google Calendar |
| `/dev/tokens` | `TokensV1` – token guideline rendered from `tokens.ts` (dev only) |

## Where things live

| Path | Purpose |
| --- | --- |
| `src/styles/tokens.ts` | Only source of colours, fonts, radii, timeline geometry (`theme.css` is generated) |
| `src/modules/http` | API client: envelope, `ApiError`, UTC ↔ `Date`, `X-Client-Id`, central error handling (`QueryProvider`) |
| `src/modules/realtime` | One WebSocket per open trip with jittered reconnect and seq-gap resync |
| `src/modules/auth` | Session (server guard + `['me']`), trip-role permissions (`TripCan`, `useTripPermission`) |
| `src/modules/preferences` | Language (`id` default, `en`) and theme (light/dark/system) |
| `src/shared/time` | Trip-timezone math: `dayBounds`, `minutesOfDay`, `snap`, `formatTime`, DST-safe |
| `src/features/library` | Library list, item page, Tiptap editor with `/` menu and Markdown mode, category colours |
| `src/features/schedule` | Day strip, timeline, drag/resize, no-overlap placement, optimistic updates, drag previews |
| `src/features/trips` | Trip list/workspace/settings pages, realtime cache sync |
| `src/features/invites`, `calendar`, `uploads`, `presence` | Invites and join page, Calendar sync, image upload behind the scenes, presence |

The boilerplate demo pages (`/dashboard`, `/users`, `DashboardLayout`, demo access snapshot) are still in the tree and can be removed.
