# Feature Matrix

Scores 0 to 3 (see README section 4: 0 absent, 1 present but weak or buried, 2 solid and on par, 3 best in class). All scores are desk-based, drawn from the app profiles in `apps/` and the official and marketing material they cite, because hands-on testing (Phase 4) was descoped. The `*` marker for marketing-based scores is dropped since it would apply to every cell. `?` means the profile gives no basis for a score. Scored 2026-10-02.

| Dimension | Fitbod | Hevy | Strong | JEFIT | MyFitnessPal | MacroFactor | Cronometer | Lose It! | Sweatmates | GymRats | FitPartner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Meal logging speed | 0 | 0 | 1 | 0 | 2 | 3 | 2 | 2 | 0 | 0 | 1 |
| Food database and barcode | 0 | 0 | 0 | 0 | 2 | 3 | 3 | 2 | 0 | 0 | 0 |
| Workout logging speed | 2 | 3 | 3 | 1 | 1 | 2 | 1 | 1 | 1 | 1 | 1 |
| Weight logging and trend | 0 | 2 | 1 | ? | 2 | 3 | 2 | 2 | 0 | 0 | 1 |
| Calorie and macro targets | 0 | 0 | 0 | 0 | 2 | 3 | 2 | 2 | 0 | 0 | 1 |
| Workout programming | 3 | 2 | 0 | 2 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |
| AI features | 2 | 1 | 0 | 1 | 3 | 3 | 2 | 2 | 0 | 0 | 0 |
| Streaks and habits | ? | 2 | ? | 1 | 2 | 1 | 2 | 2 | 3 | 2 | 2 |
| Reminders, widgets, watch | 2 | 2 | 3 | 2 | 2 | 2 | 2 | 1 | 2 | 1 | 0 |
| Progress and history | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 1 | 0 |
| Partner or friend linking | 1 | 2 | 0 | 2 | 2 | 0 | 1 | 1 | 3 | 2 | 3 |
| Shared real-time view | 0 | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 2 | 2 | 3 |
| Group challenges | 0 | 1 | 0 | 2 | 1 | 0 | 0 | 1 | 3 | 3 | 1 |
| Free tier generosity | 0 | 3 | 2 | 2 | 1 | 0 | 2 | 1 | 0 | 2 | 3 |
| Price and plans | 2 | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | ? |
| Platforms | 2 | 3 | 2 | 3 | 3 | 2 | 3 | 3 | 1 | 2 | 2 |

## Totals

Sums per group. `?` counts as 0, so totals for Fitbod, Strong, JEFIT and FitPartner are floors.

| Group | Fitbod | Hevy | Strong | JEFIT | MyFitnessPal | MacroFactor | Cronometer | Lose It! | Sweatmates | GymRats | FitPartner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Logging | 2 | 5 | 5 | 1 | 7 | 11 | 8 | 7 | 1 | 1 | 3 |
| Guidance | 5 | 3 | 0 | 3 | 5 | 8 | 4 | 4 | 0 | 0 | 1 |
| Engagement | 5 | 6 | 5 | 5 | 6 | 5 | 6 | 5 | 6 | 4 | 2 |
| Shared | 1 | 4 | 0 | 5 | 4 | 0 | 1 | 2 | 8 | 7 | 7 |
| Business | 4 | 9 | 6 | 7 | 6 | 4 | 7 | 6 | 2 | 6 | 5 |
| **Overall** | **17** | **27** | **16** | **21** | **28** | **28** | **26** | **24** | **17** | **18** | **18** |

## Scoring rationale

Scoring rules applied across apps so the same evidence gets the same score:
- Partner linking: a one-off share link with no lasting connection scores 0; a lasting connection (friend, follow, shared billing) with little or no progress visibility scores 1; a friend graph that shows progress scores 2; a dedicated two-person pairing scores 3.
- Free tier: no usable free tier scores 0; free tier with core logging paywalled or heavy ads scores 1; generous free tier with ads or caps scores 2; full core loop free with no ads scores 3.
- Platforms: iOS, Android and web logging scores 3; two of the three (or a PWA without native or watch apps) scores 2; one platform scores 1.
- Exercise logged only as duration or calorie burn, or as a check-in without sets and reps, scores 1 for workout logging.

**Fitbod**
- Highs: workout programming 3 and progress 3. The proprietary algorithm picks exercises, sets, reps and weights from history and estimated recovery, trained on 150M+ workouts; Insights adds Strength Score, recovery heat map, volume trends and PRs.
- Lows: no calorie, macro or protein tracking (0 on meal, food database and targets); free tier 0 since logging stops after the 7-day trial. Body weight trend was not found in the help center, so weight is 0 on thin evidence.
- Shared (1): linking is 1 for the Duo plan (two accounts, one bill) and share links; view and challenges are 0 because Fitbod states Duo members cannot see each other's data and no friends, feed or challenges exist.
- Streaks `?`: the profile is silent on any individual streak.

**Hevy**
- Highs: workout logging 3 (fast, simple logging is about 60% of sampled reviews and the top praise in a 65K review analysis), free tier 3 (unlimited logging, no ads), price 3 (USD 23.99 per year, lifetime option, category floor), platforms 3 (iOS, Android, web, both watches).
- Lows: no nutrition at all (0 on meal, database, targets). AI 1 because Trainer is rules-based by Hevy's own description and LLM help is outsourced to ChatGPT or Claude.
- Shared (4): follows and feed give linking 2; Profile Compare is the closest two-person view in lifting but covers workouts only and keeps weight private (1); leaderboards among followed users with no groups or challenges (1).

**Strong**
- Highs: workout logging 3 (minimal, fast logging is the top praise theme), reminders, widgets and watch 3 (standalone Apple Watch logging, Live Activity rest timer, calendar widgets, Siri Shortcuts).
- Lows: no AI and no programming (0 each, by deliberate choice); targets 0; meal logging only 1 because calories are imported from Apple Health or Google Fit or typed in as a measurement.
- Shared (0): the only sharing is a one-way share sheet link that imports a copy; no friends, feed, view or challenges.
- Streaks `?`: the profile does not mention any streak or habit mechanic.

**JEFIT**
- Highs: platforms 3 (iOS, Android, web member pages, Apple Watch and Wear OS); programming 2 (adaptive plans, Adaptive Mesocycle, 27,000+ plans).
- Lows: workout logging 1 because the top complaints are UI bloat adding taps per set and sync data loss; no nutrition (0 on meal, database, targets). AI 1: "AI-powered" adaptive plan adapts only to logged sets, and the AI positioning could not be verified in cross-check.
- Shared (5): friends, following and groups (linking 2); private compare records on 1RM and workout time (view 1); seasonal team Group Challenges and leaderboards (challenges 2).
- Weight `?`: the profile is silent on body weight logging.

**MyFitnessPal**
- Highs: AI 3 (Meal Scan, photo upload, voice logging, AI Coach, AI meal plans, Cal AI acquisition); platforms 3 (iOS, Android, web, Apple Watch).
- Lows: free tier 1 (barcode scan behind Premium, ads, paywall creep is 30 to 40% of complaint reviews); workout logging 1 and programming 0 (exercise logging only, no lifting).
- Food database 2, not 3: very large (20.5M+ foods) but search accuracy and duplicate entries draw complaints, and barcode is paid.
- Shared (4): friends with diary privacy levels and meal copying (linking 2, but resting on a third-party source after the official help page returned 404); viewing a friend's diary (view 1); challenges exist only as forum threads (1).

**MacroFactor**
- Highs: meal logging 3, food database 3, weight trend 3, targets 3, AI 3. The adaptive expenditure algorithm adjusts targets weekly from trend weight, and logging has search, barcode, label scan, describe, photo and recipe scan.
- Lows: free tier 0 (7-day trial then paid, the most common complaint); streaks 1 (habit tracking only, reviewers note no gamification).
- Shared (0): no friends, partners, feed, challenges or family plan; the only user-to-user feature is a recipe or custom food deep link, and nothing social is on the roadmap.
- Workout logging 2 and programming 2 come from the separate Workouts app, which needs its own subscription.

**Cronometer**
- Highs: food database 3 (lab-analyzed and verified data, 95 nutrients, barcode listed in the free tier); platforms 3 (iOS, Android, web, Apple Watch and Wear OS).
- Lows: workout logging 1 (duration and calorie based, no sets and reps); programming 0; free tier held to 2 by full-screen and video ads.
- Shared (1): friend by email exists only to share custom foods and recipes on Gold (linking 1); staff confirm accounts cannot be viewed jointly (view 0); no challenges (0). The forum holds 8 partner requests since 2018, none shipped.

**Lose It!**
- Highs: platforms 3 (iOS, Android, web, Apple Watch); meal logging, database, weight, targets, AI and streaks all at 2 (daily calorie budget, 50M+ foods, logging streak, Snap It and voice).
- Lows: free tier 1 (barcode and label scanning moving to Premium, interstitial and video ads); reminders, widgets and watch 1 (smartwatch sync is Premium); workout logging 1 (calorie burn only).
- Shared (2): friends by email with undocumented visibility (linking 1); no shared view (0); support groups listed and challenges described only by third parties (1).

**Sweatmates**
- Highs: streaks 3, partner linking 3 and challenges 3. Each partner sets a weekly goal, the week resolves as a pair, with wagers, Pinky Promise, Treat Yourself rewards and nudges; the partner invite is the core flow. Challenges is 3 for pair accountability; it has no groups.
- Lows: free tier 0 (workout logging requires a subscription, the largest complaint); no nutrition, weight or sets by explicit design (0 on meal, database, weight, targets); platforms 1 (iOS only, Android unconfirmed); price 1 (opaque SKUs, yearly only per reviewers, unknown if one subscription covers both).
- Shared (8): view is 2, not 3, because the partner sees photo check-ins and weekly progress instantly but no numbers.

**GymRats**
- Highs: challenges 3 (Challenges and Clubs, four scoring modes, teams, verification levels, group chat).
- Lows: no nutrition or weight (0 on meal, database, weight, targets); workout logging 1 because the Train tab is new (September 2026) and set depth is unconfirmed; reminders and watch 1 (no watch app, health sync only).
- Shared (7): groups and the new Friends feature give linking 2; the feed and leaderboard give a live view of a group (2); no couples mode or shared goal where a period counts only if both hit it.
- Free tier 2: unlimited participants but 2 active groups and ads.

**FitPartner** (scored from the current code)
- Highs: partner linking 3 (household pairing by 6 character code, capped at two); shared real-time view 3 (Supabase Realtime dashboard of both partners' calories and protein against targets); free tier 3 (everything free, no ads).
- Lows: food database 0 (no database or barcode); programming 0, AI 0, reminders 0, progress and history 0 (no history views, no trend chart). Meal, workout and weight logging are each 1: manual name, calories and protein; name, duration and notes with no sets or reps; daily weight with no trend.
- Shared (7): the shared weekly streak (both hit their own target) gives streaks 2 and challenges 1; it lacks Sweatmates' nudges, rewards and wagers.
- Price `?`: no pricing exists yet. Platforms 2: a PWA runs on any phone and desktop but has no native or watch app.

## Read across

- **Category is strong on solo logging and solo guidance.** Nutrition apps score 7 to 11 on Logging and MacroFactor reaches 8 of 9 on Guidance; lifting apps hit 3 on workout logging (Hevy, Strong) and programming (Fitbod). Every app except Sweatmates scores 2 or 3 on platforms, and Engagement sits at 4 to 6 for all ten competitors.
- **Category is weak on shared progress.** Eight of ten competitors score 0 or 1 on the shared real-time view; only the two social apps reach 2, and neither shows nutrition or weight. No app combines nutrition, weight and lifting with a two-person view, and per-person pricing is the norm (only Fitbod sells a Duo plan, with no shared visibility).
- **FitPartner is already ahead on the shared view.** It is the only 3 on shared real-time view and ties Sweatmates at 3 on partner linking, with a free tier no competitor beyond Hevy matches. Its Shared total of 7 equals GymRats and trails only Sweatmates (8), while covering calories, protein and weight that neither social app tracks.
- **FitPartner is furthest behind on Guidance and history.** It scores 1 of 9 on Guidance (static targets, no programming, no AI) against MacroFactor's 8, and 0 on progress and history, food database and reminders. A food database with barcode and a weight trend chart are the biggest single-cell gaps against the nutrition apps.
- **Least certain score: MyFitnessPal partner linking (2) and shared view (1).** Both rest on a third-party blog because the official friends and diary privacy help page returned 404, and the newsfeed may have been removed. FitPartner's free tier 3 is also provisional because no pricing has been set, and the four `?` cells (Fitbod and Strong streaks, JEFIT weight, FitPartner price) make those totals floors.
