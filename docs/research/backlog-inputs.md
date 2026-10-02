# Backlog Inputs: Borrow, Beat, Skip

**Date:** 2026-10-02
**Status:** Draft for Josh. Nothing here is approved.
**Basis:** Desk research only. Phase 4 hands-on testing was descoped, so every profile is still `unverified`. The independent cross-check audited 88 claims: 73 confirmed, 3 corrected, 12 could not be verified ([cross-check](log/cross-check.md)). Review theme shares in the profiles are rough estimates from small, skewed samples, and Reddit could not be searched directly.

**What this is:** a translation of the 10 competitor profiles into product inputs for FitPartner. It compares against what FitPartner has today ([README](../../README.md)): household pairing by code, a real-time shared dashboard of both partners' calories and protein against targets, manual meal entry (no food database or barcode), daily weight entry (no trend), workout entry (name, duration, notes; no sets or reps), a shared weekly streak (a week counts when both hit their own target), PWA, no pricing, no AI, no reminders, no history.

**Effort key** (rough guess for this Next.js + Supabase codebase): **S** is a new column or component on existing tables, a few evenings. **M** is a new table, a new screen or a new platform capability (push, storage, billing). **L** is a new domain or external dependency (food data, lift tracking model).

## Borrow

Features competitors already prove out, reframed for two people.

| Feature | Seen in | Why it matters for a couple | Effort | Evidence |
|---|---|---|---|---|
| Weight trend line (smoothed), not just daily entries | MacroFactor, MyFitnessPal | Trend avoids daily scale friction when a partner can see your number; MyFitnessPal users got angry when weight graphs broke | S | [macrofactor](apps/macrofactor.md), [myfitnesspal](apps/myfitnesspal.md) |
| History that is never locked | Strong, Hevy (as a complaint) | Couples look back at weeks together; Strong promises free history, Hevy caps free graphs at 3 months and draws complaints | M | [strong](apps/strong.md), [hevy](apps/hevy.md) |
| Copy a partner's meal into my own log with my own portion | MyFitnessPal (copy from friend), Cronometer forum requests | Couples usually eat the same dinner; this is the most repeated couples request in the Cronometer forum since 2018 | M | [cronometer](apps/cronometer.md), [myfitnesspal](apps/myfitnesspal.md) |
| Shared household meal and recipe library | MacroFactor (recipe share by link), Cronometer (recipe from diary items) | Both partners log from the same saved meals instead of re-entering them | M | [macrofactor](apps/macrofactor.md), [cronometer](apps/cronometer.md) |
| Partner nudges | Sweatmates | Lightweight accountability between two people; shipped May 2026 | S in app, M with push | [sweatmates](apps/sweatmates.md) |
| Partner approves a forgotten workout (Pinky Promise) | Sweatmates; Hevy has backdate recovery for streaks | A shared streak breaks for both when one person forgets to log; this keeps it fair | S | [sweatmates](apps/sweatmates.md), [hevy](apps/hevy.md) |
| Shared reward when the streak goal is hit (Treat Yourself) | Sweatmates | Turns the joint streak into a joint goal with a payoff | S | [sweatmates](apps/sweatmates.md) |
| Per-metric privacy (weight private unless shared) | Coupleats, Hevy (weight private to owner), MyFitnessPal (diary privacy levels) | Not every partner wants their weight visible; a toggle lowers the bar to join | S | [phase 1](log/phase-1-discovery.md), [hevy](apps/hevy.md), [myfitnesspal](apps/myfitnesspal.md) |
| Fast set logging: previous values prefilled, one tap per set, rest timer | Hevy, Strong | Fast logging is the top praise theme for both; FitPartner has no sets or reps today | L | [hevy](apps/hevy.md), [strong](apps/strong.md) |
| Side by side compare layout | Hevy (Profile Compare), JEFIT (compare records) | Closest existing two-person view in the category; a template for a lifting panel | M | [hevy](apps/hevy.md), [jefit](apps/jefit.md) |
| Weekly and monthly shareable recap | Sweatmates, JEFIT (Year in Review), GymRats (year in review video) | A natural share moment for a couple and a low-cost growth loop | M | [sweatmates](apps/sweatmates.md), [jefit](apps/jefit.md), [gymrats](apps/gymrats.md) |
| Optional photo on a workout check-in | Sweatmates, GymRats | Photo check-ins are the core praised loop in both; keep it optional | M | [sweatmates](apps/sweatmates.md), [gymrats](apps/gymrats.md) |
| Voice or text describe logging for meals | Lose It!, MacroFactor, MyFitnessPal | Fastest way to beat database search; one sentence can log a shared meal | M to L | [lose-it](apps/lose-it.md), [macrofactor](apps/macrofactor.md) |
| Hand off AI to ChatGPT or Claude via export | Hevy | Gets AI value without building a coach | S | [hevy](apps/hevy.md) |
| Non-judgmental colours and copy for going over target | MacroFactor | Matters more when your partner sees your numbers | S | [macrofactor](apps/macrofactor.md) |
| Plan one session, auto-scale it for the other person | Fitbod (share workout link) | Partners train together at different strengths | L | [fitbod](apps/fitbod.md) |

## Beat

Gaps or weaknesses in competitors that FitPartner can answer.

| Competitor weakness | Apps affected | How FitPartner beats it | Effort |
|---|---|---|---|
| No shared two-person view of progress | Hevy, Strong, JEFIT, MyFitnessPal, MacroFactor, Cronometer, Lose It!, GymRats ([hevy](apps/hevy.md), [strong](apps/strong.md), [jefit](apps/jefit.md), [myfitnesspal](apps/myfitnesspal.md), [macrofactor](apps/macrofactor.md), [cronometer](apps/cronometer.md), [lose-it](apps/lose-it.md), [gymrats](apps/gymrats.md)) | Real-time shared dashboard already exists | Done |
| Sold for couples, but partners cannot see each other | Fitbod Duo Plan ([fitbod](apps/fitbod.md)) | Shared view is the product, not a billing bundle | Done |
| Nutrition only or lifting only, so a couple runs two apps each | No nutrition: Fitbod, Hevy, Strong, JEFIT, Sweatmates, GymRats. No sets and reps: MyFitnessPal, Cronometer, Lose It!. Separate paid app: MacroFactor ([hevy](apps/hevy.md), [cronometer](apps/cronometer.md), [macrofactor](apps/macrofactor.md), [sweatmates](apps/sweatmates.md)) | Food, protein, weight and training in one shared view. Lifting depth is the missing half today | L (sets and reps) |
| Competitive ranking, not a cooperative goal | GymRats, Hevy leaderboards, JEFIT ([gymrats](apps/gymrats.md), [hevy](apps/hevy.md), [jefit](apps/jefit.md)) | Joint weekly streak where the week counts only if both hit their own target | Done |
| Priced per person, no household plan | Hevy, Strong, Lose It!, Cronometer, MacroFactor, GymRats ([hevy](apps/hevy.md), [strong](apps/strong.md), [lose-it](apps/lose-it.md), [cronometer](apps/cronometer.md), [macrofactor](apps/macrofactor.md), [gymrats](apps/gymrats.md)) | One price covers both partners | M (billing) |
| Hard paywall, or paywall shown only after onboarding and partner invite | Sweatmates (largest complaint), MacroFactor, Fitbod ([sweatmates](apps/sweatmates.md), [macrofactor](apps/macrofactor.md), [fitbod](apps/fitbod.md)) | Two people can pair and log free; price shown up front | S (policy) |
| Paywall creep on basic logging (barcode moved to paid) | MyFitnessPal, Lose It! ([myfitnesspal](apps/myfitnesspal.md), [lose-it](apps/lose-it.md)) | Keep core logging free | S (policy) |
| Ads in the free tier | Cronometer, Lose It!, MyFitnessPal, GymRats; JEFIT conflicting ([cronometer](apps/cronometer.md), [lose-it](apps/lose-it.md), [myfitnesspal](apps/myfitnesspal.md), [gymrats](apps/gymrats.md)) | No ads | S (policy) |
| Billing and trial auto-renew complaints | Fitbod, Sweatmates, Lose It!, MyFitnessPal ([fitbod](apps/fitbod.md), [sweatmates](apps/sweatmates.md), [lose-it](apps/lose-it.md)) | Clear trial terms, monthly option, easy cancel | S once billing exists |
| iOS only or no web | Sweatmates, Coupleats (iOS only); MacroFactor (no web app) ([sweatmates](apps/sweatmates.md), [phase 1](log/phase-1-discovery.md), [macrofactor](apps/macrofactor.md)) | PWA works for mixed iPhone and Android couples | Done |
| Added taps and UI bloat after redesigns | MyFitnessPal (April 2026 redesign), JEFIT ([myfitnesspal](apps/myfitnesspal.md), [jefit](apps/jefit.md)) | Keep the fewest taps to log; measure it | Ongoing |
| Sync failures and lost data | JEFIT, GymRats, Hevy (Watch) ([jefit](apps/jefit.md), [gymrats](apps/gymrats.md), [hevy](apps/hevy.md)) | Realtime already in place; offline logging is still missing per the README | M |
| Photo only logging is awkward | Sweatmates ([sweatmates](apps/sweatmates.md)) | Real data entry, photo optional | Done |

## Skip

| Skip | Reason |
|---|---|
| Proprietary progression algorithm | Fitbod's moat, and both Fitbod and Hevy Trainer still draw calibration complaints ([fitbod](apps/fitbod.md), [hevy](apps/hevy.md)) |
| Large exercise video library | Costly to produce and not the couples differentiator ([fitbod](apps/fitbod.md), [jefit](apps/jefit.md)) |
| Native watch apps | A steady source of sync bug reports for Fitbod, Hevy and JEFIT ([fitbod](apps/fitbod.md), [hevy](apps/hevy.md), [jefit](apps/jefit.md)) |
| Public follow graph, feeds, global leaderboards | Hevy already does it well; FitPartner is private between two people ([hevy](apps/hevy.md)) |
| Open community groups and public challenges | Moderation burden and safety complaints at Lose It! ([lose-it](apps/lose-it.md)) |
| Lock In Mode (locking a partner's apps) | Controlling, and needs native Screen Time access a PWA cannot get ([sweatmates](apps/sweatmates.md)) |
| Mandatory photo proof | Some Sweatmates users find it awkward in a gym ([sweatmates](apps/sweatmates.md)) |
| Money wagers | Trust breaks badly when a check-in fails to sync ([gymrats](apps/gymrats.md)) |
| AI generated art and AI video ads | Sweatmates reviewers call it deceptive ([sweatmates](apps/sweatmates.md)) |
| Competing on food database size or AI photo depth | MyFitnessPal (with Cal AI) and MacroFactor will outspend ([myfitnesspal](apps/myfitnesspal.md), [macrofactor](apps/macrofactor.md)) |
| 95-nutrient depth and clinical reports | Couples here need calories, protein and weight ([cronometer](apps/cronometer.md)) |
| Meal planner, recipe catalogue, grocery delivery | MyFitnessPal Premium+ territory, high cost ([myfitnesspal](apps/myfitnesspal.md)) |
| Trainer coach mode and huge plan libraries | Drives choice overload at JEFIT ([jefit](apps/jefit.md)) |
| Stacked lifetime upsells | Double billing complaints at Lose It! ([lose-it](apps/lose-it.md)) |

## Candidate backlog

**Proposal for Josh to approve.** Ranking reflects evidence strength and effort, and assumes FitPartner stays useful for Josh and April whatever the go or no-go choice. Item 11 only applies if a public launch is chosen.

### Now

| # | Item | Effort | Rationale |
|---|---|---|---|
| 1 | Weight trend line and basic history (week and month views) | S to M | Listed as missing in the README; trend weight is MacroFactor's top praise and broken graphs drew MyFitnessPal anger ([macrofactor](apps/macrofactor.md), [myfitnesspal](apps/myfitnesspal.md)) |
| 2 | Log once for both: copy a partner's meal with my own portion | M | Most repeated couples request found anywhere, 8 Cronometer sources from 2018 to 2025, none shipped ([cronometer](apps/cronometer.md)) |
| 3 | Partner nudge plus Pinky Promise (partner approves a forgotten workout) | S | Protects the shared streak, FitPartner's core mechanic; both shipped by Sweatmates in 2026 ([sweatmates](apps/sweatmates.md)) |
| 4 | Per-metric privacy toggle (weight visible or private) | S | Coupleats keeps weight private by default and Hevy keeps it owner only ([phase 1](log/phase-1-discovery.md), [hevy](apps/hevy.md)) |

### Next

| # | Item | Effort | Rationale |
|---|---|---|---|
| 5 | Sets, reps and weight logging with previous values prefilled | L | Closes the lifting half; fast logging is the top praise theme for Hevy and Strong ([hevy](apps/hevy.md), [strong](apps/strong.md)) |
| 6 | Saved household meals and recipes | M | Extends item 2; recipe sharing is the only shared feature MacroFactor and Cronometer offer ([macrofactor](apps/macrofactor.md), [cronometer](apps/cronometer.md)) |
| 7 | Reminders via web push, plus offline logging | M | README lists both as gaps; Sweatmates ships gym reminders, sync failures are a top complaint elsewhere ([sweatmates](apps/sweatmates.md), [gymrats](apps/gymrats.md)) |
| 8 | Shared reward when the streak goal is hit | S | Sweatmates Treat Yourself; cheap and couple specific ([sweatmates](apps/sweatmates.md)) |
| 9 | Weekly recap card, shareable | M | Present in Sweatmates, JEFIT and GymRats as a share and retention moment ([sweatmates](apps/sweatmates.md), [jefit](apps/jefit.md), [gymrats](apps/gymrats.md)) |
| 10 | Food search from an external food database | L | Table stakes for nutrition apps; manual entry only today. Source and licence to be decided ([myfitnesspal](apps/myfitnesspal.md), [cronometer](apps/cronometer.md)) |
| 11 | Couples billing: one subscription for both, clear trial, monthly option (only if going public) | M | Per-person pricing everywhere and billing complaints at Fitbod, Sweatmates and Lose It! ([sweatmates](apps/sweatmates.md), [lose-it](apps/lose-it.md)) |

### Later

| # | Item | Effort | Rationale |
|---|---|---|---|
| 12 | Barcode scanning | L | Depends on item 10; paywalling it is MyFitnessPal's biggest complaint, so it would be a free feature ([myfitnesspal](apps/myfitnesspal.md), [lose-it](apps/lose-it.md)) |
| 13 | Voice or text describe meal logging | M to L | Fast path proven by Lose It! and MacroFactor; needs an AI service and a review step ([lose-it](apps/lose-it.md), [macrofactor](apps/macrofactor.md)) |
| 14 | Optional photo on workout check-ins | M | Core praised loop in Sweatmates and GymRats; needs Supabase storage ([sweatmates](apps/sweatmates.md), [gymrats](apps/gymrats.md)) |
| 15 | Export week to ChatGPT or Claude for feedback | S | Hevy's approach to AI without building a coach ([hevy](apps/hevy.md)) |

## Open questions the research could not answer

1. Does one Sweatmates subscription cover both partners, and what exactly does each partner see? No source says ([cross-check](log/cross-check.md)).
2. Does the Fitbod Duo second member truly see nothing of the first in practice? Official pages say so; untested ([fitbod](apps/fitbod.md)).
3. What can a MyFitnessPal friend see of your diary and weight today, and is the newsfeed gone? Official help page returned 404 ([myfitnesspal](apps/myfitnesspal.md)).
4. Is Hevy Profile Compare free, and does it hide bodyweight from a followed partner? ([hevy](apps/hevy.md))
5. Is barcode scanning free on a new Cronometer account, and already locked on a new Lose It! account? ([cronometer](apps/cronometer.md), [lose-it](apps/lose-it.md))
6. How many taps and seconds does each app take to log a meal, workout and weigh-in (research question 1)? Needs the descoped hands-on trial.
7. How often do partners or spouses come up on Reddit? Reddit was blocked, so community volume is under counted ([phase 1](log/phase-1-discovery.md)).
8. Do Sweatmates buyers want nutrition or weight at all? No review asks for it, which may mean they do not, or that the sample (21 reviews) is too small ([sweatmates](apps/sweatmates.md)).
9. Which external food database fits FitPartner on cost, licence and Canadian coverage? Not researched; MacroFactor reviewers flag Canadian gaps ([macrofactor](apps/macrofactor.md)).
10. How deep is GymRats' new lifting tab (September 2026), and is a cooperative mode coming? ([gymrats](apps/gymrats.md))
