# fbClone Frontend

Frontend for the `fbClone` project, built with Next.js App Router.

This app is responsible for:
- rendering the main feed, profile pages, post permalink, login, and register flows
- calling the backend API for auth, profile, posts, comments, notifications, follows, and search
- handling interactive client state such as modal visibility, compose draft, theme preference, and cached UI state

## Stack

- Next.js 16
- React 19
- TypeScript
- TanStack Query
- Zustand
- Tailwind CSS v4
- `react-hook-form` + `zod`
- `socket.io-client`
- `next-themes`

## Project Structure

```text
frontend/
  app/
    (app)/        main application routes
    (auth)/       login and register routes
    components/   shared app shell and layout pieces
    feature/      feature-based modules: feed, post, profile, auth, story
    share/        shared API utils, providers, hooks, stores, constants
    globals.css
    layout.tsx
  components/     shared UI components
  lib/            small shared utilities
  public/
  .env.local
  package.json
```

## Current Data Flow

The frontend currently follows these rules:

- `currentUser` is not persisted in Zustand.
- app-wide persisted storage is kept for UI state only, such as theme preference.
- when it is clean and useful, data is fetched in a nearby Server Component and passed to the Client Component that needs it.
- React Context is kept narrow and only used where it is still justified, instead of becoming a general data store.
- highly interactive areas can still use client fetches when pushing everything to the server would make the code harder to maintain.

Examples in the current codebase:
- `app/(app)/layout.tsx` fetches the current user for the main app shell branch.
- `app/(app)/profile/page.tsx`, `app/(app)/profile/[handle]/page.tsx`, and `app/(app)/profile/edit/page.tsx` fetch server-side data close to the route and pass it down.
- `app/share/stores/appSessionStore.ts` persists theme/UI state only.

## Environment Variables

Create `frontend/.env.local` with:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

If the backend runs on another host or port, update this value accordingly.

## Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Build

Production build:

```bash
npm run build
npm run start
```

## Notes

- This frontend expects the backend API to be available and to support cookie-based auth for server-side requests.
- Notifications use `socket.io-client` on the frontend.
- Query caching is handled with TanStack Query.
- Local persisted state should stay limited to UI concerns; avoid storing user/profile auth data in browser storage.
