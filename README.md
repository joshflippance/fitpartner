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
| `npm test` | Unit tests (Vitest): streak, dates, logging window, weight trend, meal helpers |
| `npm run test:db` | Applies all migrations to a scratch Postgres and runs the RLS and trigger tests in `supabase/tests/` (needs `PG*` env vars) |
| `npm run typecheck` | Generates route types and runs `tsc` |
| `npm run lint` | ESLint |

CI runs lint, typecheck, unit tests, build and the database tests on every push (`.github/workflows/ci.yml`). Production setup is in [docs/DEPLOY.md](docs/DEPLOY.md).

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
  components/         Dashboard, Logger, History, WeightChart, PortionSheet, PairForm, ProgressBar, BottomNav, ui
  hooks/useHouseholdData.ts   loads household data + Supabase Realtime subscription
  lib/
    supabase/         browser, server and proxy clients
    streak.ts         shared weekly streak
    trend.ts          smoothed weight trend
    meals.ts          recent meals and portion scaling
    session.ts        requireUser / requireHousehold guards
  proxy.ts            session refresh + auth redirects (Next 16 "proxy", formerly middleware)
supabase/migrations/  schema, RLS policies, pairing RPCs, realtime publication
supabase/tests/       Postgres tests for RLS and triggers (run by scripts/test-db.sh)
scripts/generate-icons.mjs  regenerates PWA icons
```

## Data model

| Table | Notes |
|---|---|
| `households` | name, unique `pair_code` |
| `profiles` | 1:1 with `auth.users`, auto-created on signup; calorie/protein targets, weekly workout target, weight unit, `household_id`, `share_meals`, `share_weight` |
| `meal_logs` | per meal: calories, protein |
| `weight_logs` | one per user per day, stored in kg |
| `workout_logs` | name, duration, notes, `status` (counted, pending, declined) |
| `nudges` | partner nudges; created only through `send_nudge()` (1 hour cooldown) |
| `exercises` | starter library (`household_id` null) plus household custom exercises; muscle group and required equipment |
| `locations` | shared named places (Home, Gym) with an equipment list |
| `routines`, `routine_exercises` | household routines; owner edits, partner can use or `copy_routine()`; per exercise sets, rep range, rest |
| `workout_sets` | per-set reps and weight (kg) for a workout in `workout_logs` |

RLS: you write only your own rows. You read your partner's workouts always, and their meals and weight only when they share them (`can_see()`).

## Partner features

- **Log once for both:** on the Log screen, "Add to mine" copies a partner's meal at your own portion.
- **Quick add:** your 10 most recent distinct meals as one-tap chips, plus "copy yesterday".
- **Nudges:** one tap on the partner's dashboard card; they see a banner in real time.
- **Pinky Promise:** a workout dated more than 2 days before it's logged (`late_log_days()`) is pending until the partner taps "Count it". Pending and declined workouts don't count toward the streak. Status is set by a trigger, so it can't be forged from the client. Solo households skip the check.
- **Privacy:** Settings toggles for sharing meals and weight. Enforced in the database, not just hidden in the UI.
- **History:** smoothed weight trend per person (30 days, 90 days, 1 year) and a week view of both partners' calories, protein and workouts.

## Lifting

- **Lift tab:** pick a location, start a routine or an empty workout, resume one in progress.
- **Session:** each exercise shows a target and the reason, last session's sets, and set rows prefilled with the target. Tap ✓ to log a set and start the rest timer. Tap a logged set to edit or delete it.
- **Progression (`src/lib/progression.ts`):** rep ranges. Same weight and one more rep until every working set hits the top of the range, then add 5 lb upper or 10 lb lower body (2.5 or 5 kg) and drop to the bottom of the range.
- **Exercises and locations:** exercises list the equipment they need; a location filters the library to what it has. Bodyweight is always available.
- A finished lifting session is a normal `workout_logs` row, so it counts toward the weekly streak.

## Weekly streak

Each person sets a weekly workout target in Settings (default 3). A week counts when **both** of you train on at least your target number of distinct days. Weeks start Monday (`WEEK_STARTS_ON` in `src/lib/streak.ts`). The current week adds to the streak once it is complete, so the streak never drops mid-week.

## Real-time sync

`useHouseholdData` subscribes to `postgres_changes` on all five tables, filtered to the household. Any change triggers a debounced refetch, so totals and the streak stay correct for inserts, edits and deletes. It also refetches when the app returns to the foreground.

## Not in the MVP yet

- Service worker / offline logging
- Food database or barcode lookup
- Program templates and AI-generated sessions (deferred)
