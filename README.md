# FitPartner

Mobile-first PWA for two people to track calories, protein, body weight and workouts in one shared, real-time workspace.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Auth, Postgres, RLS, Realtime)

## Setup

1. **Create a Supabase project** at supabase.com.
2. **Run the migrations** in filename order from `supabase/migrations/` in the SQL editor, or with the CLI:
   ```bash
   supabase link --project-ref YOUR_REF
   supabase db push
   ```
3. **Env vars.** Copy `.env.example` to `.env.local` and fill in the project URL and publishable key (Project settings > API).
4. **Auth settings** (Authentication > URL configuration): set Site URL to your app URL and add `http://localhost:3000/**` to redirect URLs. For two known users you can turn off "Confirm email" to skip the email step.
5. **Run it**
   ```bash
   npm install
   npm run dev
   ```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm test` | Unit tests (Vitest) for streak, date and logging window logic |
| `npm run typecheck` | Generates route types and runs `tsc` |
| `npm run lint` | ESLint |

CI runs lint, typecheck, tests and build on every push (`.github/workflows/ci.yml`). Production setup is in [docs/DEPLOY.md](docs/DEPLOY.md).

## Logging window

Entries can be added or edited for any day in the current or previous week (date arrows on the Log screen). The database enforces a matching window so closed streak weeks can't be rewritten.

## How pairing works

1. Person A signs up, taps **Create household**, gets a 6 character code.
2. Person B signs up, enters the code, and lands on the shared dashboard.
3. Households cap at two members. Pairing runs through `create_household` / `join_household` RPCs so `household_id` can't be set directly from the client.

## Structure

```
src/
  app/
    (app)/            authed + paired routes with bottom nav
      page.tsx        dashboard
      log/            logger
      settings/       targets, units, pairing code, sign out
    login/            email/password auth (server actions)
    pair/             create or join a household
    auth/confirm/     email confirmation callback
    manifest.json     PWA manifest (standalone, icons)
  components/         Dashboard, Logger, PairForm, ProgressBar, BottomNav, ui
  hooks/useHouseholdData.ts   loads household data + Supabase Realtime subscription
  lib/
    supabase/         browser, server and proxy clients
    streak.ts         shared weekly streak
    session.ts        requireUser / requireHousehold guards
  proxy.ts            session refresh + auth redirects (Next 16 "proxy", formerly middleware)
supabase/migrations/  schema, RLS policies, pairing RPCs, realtime publication
scripts/generate-icons.mjs  regenerates PWA icons
```

## Data model

| Table | Notes |
|---|---|
| `households` | name, unique `pair_code` |
| `profiles` | 1:1 with `auth.users`, auto-created on signup; calorie/protein targets, weekly workout target, weight unit, `household_id` |
| `meal_logs` | per meal: calories, protein |
| `weight_logs` | one per user per day, stored in kg |
| `workout_logs` | name, duration, notes |

RLS: you read everything in your household, and write only your own rows.

## Weekly streak

Each person sets a weekly workout target in Settings (default 3). A week counts when **both** of you train on at least your target number of distinct days. Weeks start Monday (`WEEK_STARTS_ON` in `src/lib/streak.ts`). The current week adds to the streak once it is complete, so the streak never drops mid-week.

## Real-time sync

`useHouseholdData` subscribes to `postgres_changes` on all four tables, filtered to the household. Any change triggers a debounced refetch, so totals and the streak stay correct for inserts, edits and deletes. It also refetches when the app returns to the foreground.

## Not in the MVP yet

- Service worker / offline logging
- Food database or barcode lookup
- Exercise-level lift tracking (sets, reps, weight)
- History and weight trend charts
