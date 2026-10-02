# FitPartner Product Backlog

**Owner:** Josh Flippance
**Date:** 2026-10-02
**Status:** Order approved by Josh 2026-10-02.

**Progress:** FP-01 waiting on Josh (account steps in [DEPLOY.md](DEPLOY.md)). FP-02 to FP-05 done 2026-10-02.
**Sources:** [Backlog inputs](research/backlog-inputs.md), [feature matrix](research/feature-matrix.md), [opportunity memo](research/opportunity-memo.md), current code ([README](../README.md)). Research is desk-based only; see the caveats in each file.

## How this is ordered

One ranked list, top to bottom. Each item was ranked on four things, in this order:

1. **Blocks daily use or safety** for Josh and April (foundation first).
2. **Strengthens the couples edge** (the shared view is the one place FitPartner leads; see [read across](research/feature-matrix.md#read-across)).
3. **Evidence strength** from the research (repeated requests and proven features rank higher).
4. **Effort**, using the key below. Cheaper wins ties.

Items tagged with a **gate** only start if Josh picks that path in the [go or no-go options](research/opportunity-memo.md#go-or-no-go-options):
- **Beta gate:** needed before other couples use the app (option 2 or 3).
- **Public gate:** needed only for a public launch (option 3).

**Effort key:** **S** a few evenings on existing tables. **M** a new table, screen, or platform capability (push, storage, billing). **L** a new domain or external dependency.

## Ranked backlog

| Rank | ID | Item | Epic | Effort | Gate | Depends on |
|---|---|---|---|---|---|---|
| 1 | FP-01 ⏳ | Deploy to production (Supabase project, Vercel, auth URLs) | Foundation | S | | |
| 2 | FP-02 ✅ | Log for past dates and edit entries | Foundation | S | | |
| 3 | FP-03 ✅ | Password reset flow | Foundation | S | | FP-01 |
| 4 | FP-04 ✅ | CI checks and unit tests for streak and dates | Foundation | S | | |
| 5 | FP-05 ✅ | Confirm before leaving a household | Foundation | S | | |
| 6 | FP-06 | Weight trend line and history views | Progress | S to M | | |
| 7 | FP-07 | Recent meals quick add and copy yesterday | Logging speed | S | | |
| 8 | FP-08 | Log once for both: copy a partner's meal with my own portion | Couples | M | | FP-07 |
| 9 | FP-09 | Partner nudge and Pinky Promise | Couples | S | | FP-02 |
| 10 | FP-10 | Per-metric privacy toggle | Couples | S | | |
| 11 | FP-11 | Privacy policy, terms, account deletion, data export | Trust | M | Beta | FP-01 |
| 12 | FP-12 | Product analytics and in-app feedback | Learning | S | Beta | FP-01 |
| 13 | FP-13 | Error monitoring | Foundation | S | Beta | FP-01 |
| 14 | FP-14 | Onboarding target helper (calories and protein) | Guidance | S to M | Beta | |
| 15 | FP-15 | Sets, reps and weight logging | Lifting | L | | |
| 16 | FP-16 | Saved household meals and recipes | Couples | M | | FP-08 |
| 17 | FP-17 | Reminders via web push | Engagement | M | | FP-01 |
| 18 | FP-18 | Offline logging | Foundation | M | | |
| 19 | FP-19 | Shared reward when the streak goal is hit | Couples | S | | |
| 20 | FP-20 | Weekly recap card, shareable | Engagement | M | | FP-06 |
| 21 | FP-21 | Food search from an external database | Logging speed | L | | |
| 22 | FP-22 | Couples billing | Business | M | Public | FP-11 |
| 23 | FP-23 | Accessibility pass | Trust | S | Public | |
| 24 | FP-24 | Pairing code abuse protection | Trust | S | Public | |
| 25 | FP-25 | Barcode scanning | Logging speed | L | | FP-21 |
| 26 | FP-26 | Voice or text describe meal logging | Logging speed | M to L | | |
| 27 | FP-27 | Optional photo on workout check-ins | Engagement | M | | |
| 28 | FP-28 | Side by side lifting compare | Couples | M | | FP-15 |
| 29 | FP-29 | Export week to ChatGPT or Claude | Guidance | S | | |
| 30 | FP-30 | Plan one session, auto-scaled for the partner | Couples | L | | FP-15 |

## Item details

### Foundation: make it usable every day

**FP-01 Deploy to production** (S)
- **Why:** Nothing gets used until it runs on both phones. The code is built but not deployed.
- **Done when:** a Supabase project has both migrations applied; the app is on Vercel with environment variables set; Supabase Site URL and redirect URLs point to the production domain; both partners have installed it to their home screens.

**FP-02 Log for past dates and edit entries** (S)
- **Why:** Today the logger writes only to today's date and entries can only be deleted. A forgotten log breaks the shared weekly streak for both partners.
- **Done when:** a date picker allows any day in the current and previous week; meals, weight and workouts can be edited in place; streak and totals update for both partners in real time.

**FP-03 Password reset flow** (S)
- **Why:** No recovery path exists today. Without one, a forgotten password locks someone out.
- **Done when:** a reset email link from the login screen leads to a set-new-password page that works on the production domain.

**FP-04 CI checks and unit tests** (S)
- **Why:** The streak and date logic carry the core mechanic, and the logic was only checked by hand.
- **Done when:** a GitHub Action runs lint, typecheck, build and unit tests on each push; tests cover the weekly streak (complete week, partial week, missed week, single member) and local date edges.

**FP-05 Confirm before leaving a household** (S)
- **Why:** `leave_household` deletes the household and all its logs once the last member leaves, and nothing warns about it.
- **Done when:** a confirmation dialog states what will be deleted, and the last member must type the household name to proceed.

### Couples edge and progress

**FP-06 Weight trend line and history views** (S to M)
- **Why:** Progress and history score 0 today ([matrix](research/feature-matrix.md)). Trend weight is MacroFactor's top praise, and broken graphs angered MyFitnessPal users ([macrofactor](research/apps/macrofactor.md), [myfitnesspal](research/apps/myfitnesspal.md)).
- **Done when:** each person sees a smoothed weight trend over 30, 90 and 365 days; a week view shows daily calories, protein and workouts for both partners; history is free and never locked.

**FP-07 Recent meals quick add and copy yesterday** (S)
- **Why:** With no food database, re-typing meals is the slowest part of logging. Category reviews reward fast logging and punish added taps ([myfitnesspal](research/apps/myfitnesspal.md)).
- **Done when:** the logger shows the person's 10 most recent meals as one-tap chips, and a "copy yesterday" action adds all of yesterday's meals after a confirmation.

**FP-08 Log once for both** (M)
- **Why:** This is the most repeated couples request found anywhere: 8 Cronometer sources from 2018 to 2025, and none of the apps has shipped it ([cronometer](research/apps/cronometer.md)).
- **Done when:** on any of the partner's meals, "Add to mine" opens it prefilled; the person can scale the portion (0.5x to 2x or custom); the copy is saved as their own entry.

**FP-09 Partner nudge and Pinky Promise** (S)
- **Why:** These protect the shared streak. Sweatmates shipped both in 2026 ([sweatmates](research/apps/sweatmates.md)).
- **Done when:**
  - **Nudge:** one tap sends the partner a reminder (in app now, push after FP-17).
  - **Pinky Promise:** a workout logged more than 2 days late shows as pending until the partner approves it, and only approved workouts count toward the streak.

**FP-10 Per-metric privacy toggle** (S)
- **Why:** Not every partner wants their weight visible. Coupleats keeps weight private by default, and Hevy keeps it visible only to its owner ([phase 1](research/log/phase-1-discovery.md), [hevy](research/apps/hevy.md)). This lowers the bar for beta couples.
- **Done when:** Settings has toggles for showing weight, calories and protein to the partner; the toggles are enforced in RLS, not just hidden in the UI.

### Beta readiness (beta gate)

**FP-11 Privacy policy, terms, account deletion, data export** (M)
- **Why:** Other couples' body and food data is personal health information, and Canadian privacy law (PIPEDA) applies.
- **Done when:** privacy and terms pages are live; self-serve account deletion removes the profile and logs; CSV export covers all of a person's data. A legal review is recommended before going public.

**FP-12 Product analytics and in-app feedback** (S)
- **Why:** The beta thresholds in the memo need measuring, especially whether both partners log in 3 of 4 weeks ([memo](research/opportunity-memo.md)).
- **Done when:**
  - **Events:** sign up, pair, log meal, log weight, log workout, streak week completed.
  - **Report:** a weekly "both active" count per household.
  - **Feedback:** a link in Settings.

**FP-13 Error monitoring** (S)
- **Why:** Sync failures and lost data are top complaints at JEFIT and GymRats ([jefit](research/apps/jefit.md), [gymrats](research/apps/gymrats.md)). Without monitoring, failures in the hands of beta couples go unseen.
- **Done when:** client and server errors are captured with release tags, and failed writes alert Josh.

**FP-14 Onboarding target helper** (S to M)
- **Why:** New couples won't know their targets. Guidance scores 1 out of 9 today ([matrix](research/feature-matrix.md)).
- **Done when:** an optional step suggests calorie and protein targets from age, height, weight, activity level and goal; it shows its formula and is always editable.

### Next

**FP-15 Sets, reps and weight logging** (L)
- **Why:** It closes the lifting half of the "replace two apps" story. Fast set logging is the top praise theme for Hevy and Strong ([hevy](research/apps/hevy.md), [strong](research/apps/strong.md)).
- **Done when:**
  - **Data:** a workout holds exercises, each with sets of reps and weight; a seeded list of common exercises allows custom additions.
  - **Speed:** the last session's values are prefilled, each set takes one tap, and a rest timer is included.
  - **Units:** the person's lb or kg setting is respected.

**FP-16 Saved household meals and recipes** (M)
- **Why:** It extends FP-08. Recipe sharing is the only shared feature MacroFactor and Cronometer offer ([macrofactor](research/apps/macrofactor.md), [cronometer](research/apps/cronometer.md)).
- **Done when:** either partner can save a meal to a shared household library and log it with their own portion size.

**FP-17 Reminders via web push** (M)
- **Why:** Engagement depends on reminders. Sweatmates ships gym reminders ([sweatmates](research/apps/sweatmates.md)). Web push works on iOS 16.4+ only when the app is installed to the home screen.
- **Done when:** each person sets reminder times (for example, morning weigh-in and evening log check); nudges from FP-09 arrive as push notifications; notifications can be turned off.

**FP-18 Offline logging** (M)
- **Why:** The README lists it as a gap, and gyms often have poor signal.
- **Done when:** a service worker caches the app shell; logs made offline queue and sync when the connection returns, with no duplicates; a status indicator shows pending items.

**FP-19 Shared reward when the streak goal is hit** (S)
- **Why:** It turns the joint streak into a joint payoff, modelled on Sweatmates' Treat Yourself ([sweatmates](research/apps/sweatmates.md)).
- **Done when:** the couple sets a reward and a target number of weeks, and the dashboard shows progress and celebrates when it's reached.

**FP-20 Weekly recap card, shareable** (M)
- **Why:** Sweatmates, JEFIT and GymRats all use recaps as a retention and sharing moment ([sweatmates](research/apps/sweatmates.md), [jefit](research/apps/jefit.md), [gymrats](research/apps/gymrats.md)).
- **Done when:** each Monday a card summarizes last week for both partners (streak, workouts, average calories and protein, weight change if shared), and it can be saved as an image.

**FP-21 Food search from an external database** (L)
- **Why:** A food database is table stakes for nutrition apps; FitPartner has manual entry only.
- **Done when:** search returns calories and protein per serving from a chosen source, and results can be logged with a portion size. The source still has to be chosen on cost, licence and Canadian coverage (open question 9 in the [backlog inputs](research/backlog-inputs.md)).

### Public launch (public gate)

**FP-22 Couples billing** (M)
- **Why:** Every competitor prices per person. Billing and trial complaints are common at Fitbod, Sweatmates and Lose It! ([memo pricing options](research/opportunity-memo.md#pricing-options)).
- **Done when:** one subscription covers both partners; trial terms appear before signup; a monthly option exists; either partner can cancel. Pricing model is a separate decision.

**FP-23 Accessibility pass** (S)
- **Why:** A public product needs it.
- **Done when:** contrast meets WCAG AA in the dark theme; every control has a label; screen-reader flows work for logging and the dashboard; text resizes to 200% without breaking.

**FP-24 Pairing code abuse protection** (S)
- **Why:** The join function accepts unlimited code guesses.
- **Done when:** join attempts are rate limited per user, codes can be regenerated, and codes expire once the household is full.

### Later

**FP-25 Barcode scanning** (L)
- **Why:** Paywalling it is MyFitnessPal's biggest complaint, so it ships free ([myfitnesspal](research/apps/myfitnesspal.md), [lose-it](research/apps/lose-it.md)).
- **Done when:** the camera scan resolves through the FP-21 database, with a manual fallback.

**FP-26 Voice or text describe meal logging** (M to L)
- **Why:** Lose It! and MacroFactor show this is a fast path ([lose-it](research/apps/lose-it.md), [macrofactor](research/apps/macrofactor.md)).
- **Done when:** a sentence such as "chicken, rice and broccoli, half portion" becomes a draft entry that the person confirms before it saves.

**FP-27 Optional photo on workout check-ins** (M)
- **Why:** Photo check-ins are the core praised loop in Sweatmates and GymRats. They stay optional, because mandatory photos are a Sweatmates complaint ([sweatmates](research/apps/sweatmates.md), [gymrats](research/apps/gymrats.md)).
- **Done when:** a photo can be attached in Supabase storage, visible to the partner only.

**FP-28 Side by side lifting compare** (M)
- **Why:** Hevy's Compare is the closest two-person view in the category ([hevy](research/apps/hevy.md)).
- **Done when:** both partners' recent sessions and personal bests per exercise appear side by side.

**FP-29 Export week to ChatGPT or Claude** (S)
- **Why:** Hevy delivers AI value without building a coach ([hevy](research/apps/hevy.md)).
- **Done when:** one tap copies a structured summary of the week, ready to paste into either assistant.

**FP-30 Plan one session, auto-scaled for the partner** (L)
- **Why:** Fitbod's share link adjusts a workout to the recipient's strength ([fitbod](research/apps/fitbod.md)). It fits couples who train together at different strengths.
- **Done when:** a planned workout shared with the partner suggests weights from their own history.

## Not doing

These come from the [skip list](research/backlog-inputs.md#skip) and are revisited only with new evidence:
- Proprietary progression algorithm, or competing on AI depth or food database size.
- Exercise video library, native watch apps, 95-nutrient clinical depth.
- Public feeds, global leaderboards, open community groups.
- Lock In Mode, mandatory photo proof, money wagers.
- Meal planner, grocery delivery, coach mode, lifetime upsells, AI generated art.

## Decisions for Josh

1. ~~Approve the order~~ Approved 2026-10-02.
2. **Pick the go or no-go path.** That decides whether the beta-gated items (FP-11 to FP-14) and public-gated items (FP-22 to FP-24) come into scope.
3. **Pinky Promise window:** the proposal treats workouts logged more than 2 days late as needing approval. Options: 1, 2 or 3 days.
4. **Food database source** for FP-21, to be researched once FP-15 is underway.
