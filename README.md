# OpenSuite Next.js Boilerplate

Reusable frontend foundation for OpenSuite ecosystem apps. The goal is to keep routing thin, features isolated, authorization SDK-ready, and page versions easy to replace or roll back.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful checks:

```bash
npm run lint
npm run build
```

## Demo Routes

- `/` redirects to `/dashboard`
- `/login` renders `LoginV1`
- `/dashboard` renders `DashboardHomeV1`
- `/users` renders `UserListV1`

## Core Rule

`src/app/` is only for route mapping and layout binding. Business logic, form logic, API calls, and large UI components belong in `features/`, `modules/`, `shared/`, or `layouts/`.

Example:

```tsx
// src/app/(auth)/login/page.tsx
import { LoginV1 } from "@/features/auth/pages/LoginV1";

export default function LoginPage() {
  return <LoginV1 />;
}
```

## Structure

```txt
src/
├── app/
├── config/
├── features/
├── layouts/
├── modules/
├── shared/
├── styles/
├── types/
└── proxy.ts
```

Read `AGENTS.md` before extending the boilerplate. It is the source of truth for architecture rules, feature structure, page versioning, authorization boundaries, naming conventions, and implementation workflow.
