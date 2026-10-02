# Phase 1: Discovery for slots 9 and 10 (social / partner apps)

Date: 2026-10-02

Selection rule: apps where two or more people share goals, progress, or accountability. Target one couples-specific app and one broader accountability app, live in 2026, relevant to fitness, nutrition, or habits.

Live status and rating counts come from the Apple iTunes lookup API (US store) on 2026-10-02 unless noted. Rating counts are US App Store rating counts only, not downloads or users.

## Ranked candidates

| Rank | App | Type | One-line positioning | Sharing mechanism (what each person sees of the other) | Platforms | Pricing | Live status | Scale signal | Sources |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Sweatmates: Partner Fitness (KnightCollar LLC) | Couples | Two-person workout accountability app built around a weekly goal | Partners set a weekly workout target, log each workout with a photo that the other sees right away, view each other's progress through the week, comment, nudge, and keep streaks; optional wagers if the weekly target is missed. No nutrition or detailed lifting metrics, by design | iOS (iPhone, iPad, Mac M1, Vision, Watch). No Android listing found | Free download; Pro subscription required for logging, store lists tiers from $4.99 to $59.99 | Live. v1.4.3 released 2026-09-28; first released 2025-12-21 | 13,076 US App Store ratings, 4.91 average | [App Store](https://apps.apple.com/us/app/-/id6756000479) |
| 2 | GymRats: Fitness challenge (Avocado Apps) | Broader group | Group fitness challenges with leaderboards and check-ins | Members join a challenge, post workout check-ins with photos, see each other's check-ins and a leaderboard scored by workouts, minutes, miles, calories, steps, or custom points; group chat | iOS and Android | Free; Pro $3.99 monthly or $32.99 yearly | Live. v2026.9.25 released 2026-09-26; first released 2019-03-09 | 4,670 US App Store ratings, 4.88 average. Developer site states about 100,000 participants and about 50,000 challenges (undated) | [App Store](https://apps.apple.com/us/app/gymrats-fitness-challenge/id1453444814), [About](https://www.gymrats.app/about) |
| 3 | Coupleats: Calorie Tracker (serhan kilic) | Couples | Calorie and macro tracker built for two | Partners see each other's daily calorie and macro rings side by side, copy shared meals into their own log, send reminders and nudges, get a weekly sync report; couple XP, streaks and challenges. Weight and sensitive data stay private unless shared | iOS (iPhone, Mac M1, Vision). No Android listing found | Free; Plus $3.99 weekly, $9.99 monthly, $49.99 yearly | Live. v3.0.2 released 2026-09-02; first released 2026-05-17 | 12 US App Store ratings, 4.92 average | [App Store](https://apps.apple.com/app/id6766335737), [Product Hunt](https://www.producthunt.com/products/coupleeats/makers) |
| 4 | Shared Habit Tracker: Habitomo (Shibapp LLC) | Couples / family habits | Shared routines for couples and family | Members of a shared room see each other's daily habit progress, send reactions, and can view a home screen widget of everyone's progress today | iOS (iPhone, iPad, Mac M1, Vision) | Free; Premium $3.99 monthly or $29.99 yearly | Live. v1.12.13 released 2026-09-16; first released 2026-01-06 | 1 US App Store rating | [App Store](https://apps.apple.com/us/app/-/id6756943255) |
| 5 | HabitShare (Lucas Bickston) | Broader habits | Track habits with friends | Users choose which habits to share with which friends; friends see progress and can message | iOS (Android not checked) | Free | Stale. Last iOS update 2023-01-27, fails the live in 2026 test | 663 US App Store ratings, 4.60 average | [App Store](https://apps.apple.com/app/id1048191045) |

### Screened out

| App | Reason |
|---|---|
| Fitlove (couples workouts) | No rating overview on the store; update recency not confirmed |
| SharedStride (couples running) | Running focused; too few ratings to show; last update January (year not confirmed on the page) |
| Couple Glow | Last update 2026-05-26, 3 ratings; too thin |
| WeFit: Fitness With Friends | Last update reported as 2024-02-22; 10 ratings |
| Gymspot: Workout with Friends | Too few ratings to show |
| Groovy: Build Habits Together | Last update 2021-11-11; no ratings |

## Recommendation

- **Slot 9, couples-specific: Sweatmates.** It is the closest match to FitPartner's shared weekly workout streak and partner accountability loop, and it has by far the strongest scale signal of any couples app found.
- **Slot 10, broader accountability: GymRats.** It is the established, actively updated, cross-platform group challenge app, which shows how shared accountability works when it extends beyond a pair.
- **Fallback: Coupleats.** If a couples nutrition comparison matters more than workouts, it is the only live app found that shows partners each other's calories and macros side by side, though its scale signal is tiny.

Gap worth noting for Phase 2: no candidate combines shared nutrition, body weight, and lifting in one partner view. Sweatmates covers workouts only, Coupleats covers nutrition only.

## Partner features in the existing 8 (noted, not profiled)

| App | Partner or social feature found | Source |
|---|---|---|
| Hevy | Follow model: followers see your workout feed (duration, volume, PRs), media, routines, profile and training history, and can like and comment. No couples-specific feature | [Hevy social guide](https://help.hevyapp.com/hc/en-us/articles/35688036014231-Hevy-App-Social-Guide-Connect-Follow-and-Share-Your-Workouts), [Social features](https://www.hevyapp.com/features/social-features/) |
| Cronometer | No food diary sharing between users, per support (2020). Gold users can share custom foods and recipes with another account; support suggests saving a meal as a recipe so a partner can add it | [Forum: food log sharing](https://forums.cronometer.com/discussion/3946/does-the-app-allow-food-log-sharing), [Forum: two people](https://forums.cronometer.com/discussion/comment/11985) |
| MyFitnessPal | Diary can be set to public (third-party help article); friends feature exists. Full privacy options not confirmed in this pass | [Trainerfu help](https://help.trainerfu.com/en/articles/7175230-how-to-make-your-myfitnesspal-diary-public-on-iphone-or-ipad) |
| Lose It! | Groups and sharing progress with friends, per Wikipedia | [Wikipedia](https://en.wikipedia.org/wiki/Lose_It!_(app)) |
| Fitbod, Strong, JEFIT, MacroFactor | Not checked in this pass | |

## Forum evidence of couples wanting a shared app

Reddit was blocked from both fetch and site-restricted search in this environment, so no Reddit threads were captured. Evidence below comes from vendor forums.

- A husband asked whether he and his wife could share nutrition tracking across two Cronometer accounts; support said each needs their own account and pointed to recipe sharing as a workaround (June 2020). [Link](https://forums.cronometer.com/discussion/comment/11985)
- A Gold subscriber couple asked to copy a shared dinner from one diary into the other instead of entering it twice; support offered a multi-step recipe workaround (September 2018). [Link](https://forums.cronometer.com/discussion/comment/4900)
- A user whose spouse also pays for Cronometer requested a way to copy daily food entries between their diaries to cut duplicate logging (August 2025). [Link](https://forums.cronometer.com/discussion/6788/ability-to-share-copy-daily-food-diaries-with-others)
- A user requested a diet buddy option so two subscribers can see each other's diaries for accountability (example was siblings doing keto together, December 2020); a later commenter said lack of diary sharing was what kept them on a competitor (February 2021). [Link](https://forums.cronometer.com/discussion/3947/diet-buddy-option), [Link](https://forums.cronometer.com/discussion/3946/does-the-app-allow-food-log-sharing)
- A Fitbit community feature suggestion asks for sharing meals with friends and family so each person does not re-enter the same ingredients. [Link](https://community.fitbit.com/t5/Feature-Suggestions/Updating-barcodes-amp-sharing-saved-meals/idi-p/1626672) (not opened; title only)

Supporting signal: several 2026 listicles target the query "calorie tracker for couples" (for example [nutrola.app](https://nutrola.app/en/blog/8-best-calorie-trackers-for-couples-2026)), which suggests search demand, though these are vendor content marketing.

## Searches run

WebSearch:
1. couples fitness app track workouts together partner 2026
2. shared calorie tracking app for couples
3. accountability partner fitness app share progress friends
4. habit tracker with partner shared habits app
5. reddit app for couples to track calories together
6. reddit workout tracker app share with partner girlfriend boyfriend
7. group fitness challenge app friends leaderboard workout buddy app
8. Hevy follow friends feed; MacroFactor share with partner; Lose It friends; MyFitnessPal friends feature
9. site:reddit.com app my partner and I can both track macros see each other
10. site:reddit.com couples fitness app recommendation wife and I workout tracker shared
11. Sweatmates partner fitness app Android Google Play
12. GymRats fitness challenge app Android web gymrats.app
13. reddit "my wife and I" calorie tracking app share diary
14. MyFitnessPal diary sharing with spouse; Lose It friends challenges 2026
15. reddit r/loseit app to track with spouse see each other's calories
16. reddit r/fitness couple workout app partner see each other's workouts
17. myfitnesspal community forum share diary with husband wife partner feature request
18. MyFitnessPal diary sharing settings friends can view diary
19. Lose It! app friends feature challenges see friends progress
20. Sweatmates app KnightCollar couples workout accountability
21. Coupleats calorie tracker for couples Android
22. Reddit-restricted searches (allowed_domains reddit.com): rejected by the proxy

WebFetch: App Store pages for each candidate, iTunes lookup API for version dates and rating counts, GymRats about page, Hevy social features page, Coupleats Product Hunt page, Cronometer forum threads, findyouredge couples listicle. Reddit search JSON was blocked.
