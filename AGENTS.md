<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# OpenSuite Next.js Boilerplate Guidelines

This repository is the base frontend boilerplate for OpenSuite ecosystem apps. Treat it as a reusable enterprise foundation, not as a one-off application. Keep the code minimal, modular, versionable, and ready to be wired to real OpenSuite services later.

## Current Stack

- Framework: Next.js App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Package manager: npm
- Dev/build scripts intentionally use Webpack:
  - `npm run dev` runs `next dev --webpack`
  - `npm run build` runs `next build --webpack`

Next.js 16 may default to Turbopack. If platform/native binding issues appear, keep Webpack unless the project intentionally migrates.

## Core Architecture Rule

`src/app/` is only for routing and layout binding.

Allowed in `src/app/`:

- route mapping
- route groups
- page version selection
- layout binding
- metadata

Do not put these in `src/app/`:

- business logic
- form orchestration
- API calls
- large UI components
- permission logic
- feature-specific hooks

Correct pattern:

```tsx
// src/app/(auth)/login/page.tsx
import { LoginV1 } from "@/features/auth/pages/LoginV1";

export default function LoginPage() {
  return <LoginV1 />;
}
```

## Recommended Project Structure

```txt
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── config/
│   ├── app.config.ts
│   ├── endpoints.config.ts
│   ├── env.config.ts
│   ├── menu.config.ts
│   └── routes.config.ts
├── features/
│   ├── auth/
│   ├── dashboard/
│   └── user-management/
├── layouts/
│   ├── AuthLayout/
│   └── DashboardLayout/
├── modules/
│   ├── auth/
│   ├── http/
│   └── preferences/
├── shared/
│   └── components/
├── types/
└── proxy.ts
```

## Feature-First Pattern

Business code is grouped by feature:

```txt
features/
├── auth/
├── dashboard/
├── user-management/
├── notification/
└── settings/
```

Each feature owns its pages, sections, components, hooks, schemas, constants, types, and a service when needed.

Ideal page folder:

```txt
features/auth/pages/LoginV1/
├── index.tsx
├── components/   (optional)
├── sections/     (optional)
├── hooks/        (optional)
├── schemas/      (optional)
├── constants/    (optional)
└── types/        (optional)
```

Only create the subfolders a page actually needs — don't pre-scaffold empty ones. There is no separate `controller/` layer: `hooks/` is where form state, interaction logic, mutations, and side effects live.

## Versioned Page Pattern

Pages must be versioned:

```txt
features/auth/pages/
├── LoginV1/
└── LoginV2/
```

Routes select the active version:

```tsx
import { LoginV2 } from "@/features/auth/pages/LoginV2";

export default function LoginPage() {
  return <LoginV2 />;
}
```

This keeps redesigns, experiments, and rollback safe.

## Clean Architecture Flow

Use this dependency direction:

```txt
Page
↓
Feature Widget / Section
↓
Hook
↓
Service
↓
API Client
```

Rules:

- Components render UI and call hooks.
- Hooks handle form state, interaction logic, mutations, and side effects. This is the only logic layer between UI and services — there is no separate controller.
- Services handle business process, transformation, aggregation, orchestration, and perform the actual API calls or storage reads/writes directly — there is no separate repository layer.
- API client (thin fetch wrapper) lives in `modules/http`; services call it directly.

Do not call `fetch` directly from page components or feature UI components unless there is a very explicit framework reason.

## Shared vs Modules

Use `shared/` for generic reusable UI or helpers:

- Button
- Card
- Table
- FormInput
- date/number formatting helpers
- generic hooks
- generic types

Use `modules/` for system-level reusable logic:

- auth/session provider
- HTTP client
- language/theme preferences provider
- authorization adapter
- external service clients (wire the real OpenSuite SDK package in here once it is adopted — don't build a local wrapper module ahead of time)

## Auth and Authorization

Authentication and authorization must stay separate.

Authentication:

- handled by Keycloak, Auth.js, or another identity provider
- owns login, logout, session, and identity

Authorization:

- handled by the OpenSuite Authorization Server, consumed through the OpenSuite SDK package once it is pulled into the project
- owns permissions, menu access, route access, and dynamic rendering

Token concepts:

- Auth token is for identity/session.
- Access permission snapshot is for frontend rendering and route protection.
- Backend must always validate permission again.

Until the real SDK is adopted, `src/modules/auth/` holds a demo access-snapshot service plus `usePermission` and `useAuthorizedMenu` hooks that stand in for it. Swap their internals for real SDK calls later — keep consuming them through the same hooks so feature components don't change. Do not hardcode real permission policy into feature components.

Example rendering pattern:

```tsx
import { Can } from "@/modules/auth/components/Can";

<Can permission="user.create">
  <Button>Create user</Button>
</Can>
```

## Menu Rendering

Menu items should come from the OpenSuite Authorization Server via the SDK once it is wired in. `config/menu.config.ts` is only a fallback/demo source, filtered through `useAuthorizedMenu` in `modules/auth/hooks`.

Do not let production apps keep app menus scattered across feature pages or layout components.

## Language / i18n

`src/modules/preferences/` is the sample translation module for the boilerplate:

- `dictionaries.ts` holds flat translation keys per language (`en`, `id`). Namespace keys by feature, e.g. `dashboard.title`, `users.create`.
- `PreferencesProvider.tsx` exposes `language`, `setLanguage`, and `t(key)` through a `usePreferences()` hook, persisted to `localStorage` and synced across tabs via `useSyncExternalStore`.
- `PreferencesProvider` wraps the app in `src/app/layout.tsx`. Any component that calls `usePreferences()` must be a client component (`"use client"`).
- `DashboardLayout` renders a simple language toggle in its header, driven by `usePreferences()`.

This is a demo-scale i18n setup, not a full i18n framework. Route-based locales, pluralization, and formatting helpers should be layered on only when a real project needs them.

## Route Groups and Layouts

Use route groups to separate app surfaces:

```txt
app/
├── (auth)/
└── (dashboard)/
```

Layout components live in `src/layouts/`, not inside large app route files.

- `src/app/(auth)/layout.tsx` binds `AuthLayout`
- `src/app/(dashboard)/layout.tsx` binds `DashboardLayout`

Dashboard layout owns shell concerns such as sidebar, navbar, and content wrapper. Feature pages only render their own content.

## Global Config

Centralize all paths, endpoints, and environment variables:

- `config/env.config.ts`
- `config/endpoints.config.ts`
- `config/routes.config.ts`
- `config/menu.config.ts`
- `config/app.config.ts`

Do not hardcode endpoints like `"/api/users"` inside features. Use `endpoints.user.list`.

Do not hardcode app routes in multiple places. Use `routes.dashboard`, `routes.users`, and so on.

## Environment Variables

All server/service URLs must be configurable:

- `NEXT_PUBLIC_API_GATEWAY_URL`
- `NEXT_PUBLIC_AUTH_URL`
- `NEXT_PUBLIC_AUTHORIZATION_URL`
- `NEXT_PUBLIC_FILE_URL`
- `NEXT_PUBLIC_NOTIFICATION_URL`

Add new environment keys to `config/env.config.ts` first.

## Proxy / Middleware

This project uses `src/proxy.ts` because newer Next.js versions warn that the `middleware.ts` convention is deprecated.

Use proxy/middleware only for lightweight cross-cutting concerns:

- route protection
- auth redirect
- locale detection
- session validation

Do not put heavy business logic there.

## State Management Principle

Recommended libraries when the project becomes real:

- TanStack Query for server state, cache, and mutations
- Zustand only for local UI state such as sidebar, modal, selected tab, temporary wizard state
- React Hook Form for form state
- Zod for validation

Do not store large server data in Zustand.

## Naming Conventions

- Component: `PascalCase`
- Hook: `useXxx`
- Service: `xxx.service.ts`
- Schema: `xxx.schema.ts`
- Constant: `xxx.constant.ts`
- Type: `xxx.type.ts`

## Styling Principles

- Use Tailwind utility-first styling.
- Use CSS variables for theme tokens.
- Keep custom CSS minimal.
- Prefer reusable shared components for common primitives.
- Avoid adding a full design system until the project really needs it.

## Current Demo Routes

- `/` redirects to `/dashboard`
- `/login` renders `LoginV1`
- `/dashboard` renders `DashboardHomeV1`
- `/users` renders `UserListV1`

These are intentionally lightweight examples to prove routing, route groups, versioned pages, layouts, config boundaries, and permission rendering.

## Current Demo Permission Model

The current permission snapshot is mock/demo only:

- `src/modules/auth/services/access-snapshot.service.ts`
- `src/modules/auth/hooks/usePermission.ts`
- `src/modules/auth/hooks/useAuthorizedMenu.ts`
- `src/modules/auth/components/Can.tsx`

Replace this with real OpenSuite SDK or authorization server integration in production apps.

## Adding a New Page

1. Add a versioned page folder under the relevant feature:

```txt
src/features/settings/pages/SettingsHomeV1/
```

2. Put page sections/components/hooks inside that folder — only create the subfolders it actually needs.
3. Add or reuse route constants in `config/routes.config.ts`.
4. Add an app route that only maps to the active page version:

```tsx
import { SettingsHomeV1 } from "@/features/settings/pages/SettingsHomeV1";

export default function SettingsPage() {
  return <SettingsHomeV1 />;
}
```

5. Add permission rendering through `Can` or an SDK-backed hook when needed.

## Before Finishing Work

Run:

```bash
npm run lint
npm run build
```

If editing routes, also verify the affected URLs locally with:

```bash
npm run dev
```

Keep this boilerplate boring in the best way: predictable, small, explicit, and easy to replace piece by piece.
