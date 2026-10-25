@AGENTS.md

# FitPartner handoff

Read this first in every session. Update the **Status** section when you finish a backlog item.

## What this is

Couples fitness PWA for Josh and his partner April: shared real-time dashboard of calories, protein, weight and workouts, with a weekly streak that counts only when both hit their targets. Built for the two of them first; public launch is undecided.

## Status (last updated 2026-10-25)

- **Live:** https://fitpartner-eight.vercel.app (Vercel, auto-deploys from `main`)
- **Database:** Supabase project `fitpartner` (ref `fggbfvukmfjtoolnhfuc`), Canada Central. Migrations 1 to 7 applied (6 in two parts: tables via MCP, `save_routine_exercises` pasted by Josh)
- **Not yet done by Josh and April:** sign up and pair on the live app (0 profiles as of 2026-10-25)
- **Done:** FP-01 to FP-10, FP-15 with lifting extras, FP-16 (see `docs/BACKLOG.md`)
- **Lifting design (Josh's choices):** routines shared by the household, owner edits, partner uses or copies; shared named locations with equipment lists; rep-range progression (hit the top of the range on every set, then add 5 lb upper or 10 lb lower, 2.5 or 5 kg)
- **Next in backlog order:** FP-11 to FP-14 are gated on the launch path decision; FP-17 (reminders via web push) is the next ungated item. Workout recommendations beyond next-set suggestions (program templates or AI sessions) were deferred until after real use
- **Saved meals (Josh's choices):** simple name, calories and protein per serving, logged with a portion multiplier; either partner edits or removes; removing archives the row
- **Email confirmation:** off for the two-person launch; turn back on with custom SMTP before any beta (part of FP-11)

## Open decisions (Josh decides, do not choose for him)

1. **Launch path:** keep personal, run a 10-couple beta, or build toward public launch. Options in `docs/research/opportunity-memo.md`.
2. **Pinky Promise window:** currently 2 days (`late_log_days()` in the partner features migration). Options: 1, 2 or 3.
3. **Nudge cooldown:** currently 60 minutes (`nudge_cooldown_minutes()`). Not yet confirmed by Josh.

## How Josh works (follow these)

- Ask questions one at a time, multiple choice, and wait for the answer. Never batch questions.
- Never decide on his behalf. Present 2 to 3 options with trade-offs and let him pick. A recommendation is fine when asked.
- Concise and direct. Bullets over prose. No preamble, no praise.
- No em dashes or en dashes in anything you write.
- Push back when something is wrong or missing.

## Where things live

| What | Where |
|---|---|
| Prioritized backlog (30 items) | `docs/BACKLOG.md` |
| Production setup and notes | `docs/DEPLOY.md` |
| Competitive research, matrix, memo | `docs/research/` |
| Schema and access rules | `supabase/migrations/` (apply in filename order) |
| Database tests (RLS, triggers) | `supabase/tests/`, run with `npm run test:db` |

## Rules for changes

- `git pull` before starting; commit and push when done. The repo is the source of truth across web, Desktop and cloud sessions.
- Run `npm run lint`, `npm run typecheck`, `npm test` before pushing. CI also runs the database tests.
- Schema changes go in a new migration file, never edit applied ones. Add a test in `supabase/tests/` for any access rule.
- Applying migrations to production needs Josh's approval in the Supabase prompt. If the tool call is cancelled, send him the SQL to paste instead of retrying. Statements containing `drop` or `delete` are always cancelled from cloud sessions, so plan for a paste.
- The Vercel connector cannot reach his "flippersteam" team; deploys happen through the GitHub integration on push.
- After finishing a backlog item: mark it in `docs/BACKLOG.md` and update **Status** above.
