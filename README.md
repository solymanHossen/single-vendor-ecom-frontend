# Single Vendor Ecom — Frontend

Frontend for a single-vendor e-commerce platform, built with Next.js (App Router), shadcn/ui, and Tailwind CSS.

## Tech stack

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router, Turbopack in dev)
- **UI:** [shadcn/ui](https://ui.shadcn.com) components on top of [Radix UI](https://www.radix-ui.com), styled with [Tailwind CSS](https://tailwindcss.com) v4
- **Auth:** [NextAuth](https://next-auth.js.org) v4, credentials provider, JWT sessions
- **Validation:** [Zod](https://zod.dev)
- **Language:** TypeScript

## Getting started

Install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Secret used to sign NextAuth session tokens |
| `NEXT_PUBLIC_API_URL` / `API_URL` | Base URL of the backend API consumed by `lib/api.ts` |

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start the production server (after `build`) |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format the codebase with Prettier |
| `pnpm typecheck` | Run TypeScript in no-emit mode |

## Project structure

```
app/
  (auth)/          Public auth pages — login, register, verify-email, forgot-password
  (protected)/     Routes that require a signed-in session (e.g. dashboard)
  (admin)/         Routes that require the "admin" role
  layout.tsx       Root layout: fonts, theme provider, global metadata
  global-error.tsx Top-level error boundary
actions/           Server actions (e.g. auth.actions.ts)
auth.ts            NextAuth configuration (credentials provider, JWT/session callbacks)
auth.config.ts     Shared auth route config (public routes, admin routes, sign-in page)
components/
  ui/              shadcn/ui primitives
  theme-provider.tsx
lib/
  api.ts           Fetch wrapper for calling the backend API
  validators.ts    Zod schemas
  utils.ts         Shared utilities (e.g. `cn`)
types/             Ambient/type augmentation (e.g. next-auth.d.ts)
```

## Authentication

Auth is handled by NextAuth's credentials provider (`auth.ts`), which calls the backend's `/auth/login` endpoint via `lib/api.ts` and issues a JWT session containing the user's id, role (`user` | `admin`), and verification status. Route access rules live in `auth.config.ts`:

- Routes under `(protected)` require a session.
- Routes under `(admin)` additionally require `role === "admin"`.
- `isPublicRoute` / `isAdminRoute` helpers in `auth.config.ts` centralize this logic for reuse (e.g. in middleware).

## Adding shadcn/ui components

```bash
npx shadcn@latest add <component>
```

Generated components are placed in `components/ui` and can be imported as:

```tsx
import { Button } from "@/components/ui/button";
```

## Known issue: production build

This project currently pins `next` to `16.4.0-canary.37` because of an unresolved upstream Next.js bug: the framework's auto-generated `/_global-error` page crashes during static prerendering with `TypeError: Cannot read properties of null (reading 'useContext')`. It affects Next.js 16.0.x through the latest canary and is tracked upstream in [vercel/next.js#95741](https://github.com/vercel/next.js/issues/95741), [#86178](https://github.com/vercel/next.js/issues/86178), and [discussion #94667](https://github.com/vercel/next.js/discussions/94667).

**Impact:** `pnpm dev` works normally. `pnpm build` (and therefore production deploys) currently fails during the static export step until Vercel ships a fix.

**Workaround once a fix is released:** bump the `next` and `eslint-config-next` versions in `package.json` and re-run `pnpm build`. If it still fails, downgrading to the last known-good stable release, `next@15.5.25`, is a fallback (untested in this repo, but reported to predate the bug).
