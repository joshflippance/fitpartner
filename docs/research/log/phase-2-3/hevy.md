# Hevy research log (Phases 2 and 3)

**Date:** 2026-10-02
**Agent:** desk research and review mining agent
**Clock time:** about 18 minutes of agent time (13:19 to 13:37 UTC, first file read to log write)
**Output:** `docs/research/apps/hevy.md`

## Searches run

1. Hevy Pro price 2026 monthly yearly lifetime
2. Hevy app changelog 2026 new features
3. Hevy app AI features ChatGPT Claude integration MCP 2026
4. Hevy app compare lifts with friends leaderboard social feed features
5. "Hevy Trainer" AI generated program Pro
6. Hevy ChatGPT app @hevy announcement
7. Hevy Gym Log Workout Tracker play.google.com com.hevy
8. reddit Hevy girlfriend wife partner share workouts together
9. Hevy app reviews complaints 2026 reddit
10. Hevy feature request "workout together" OR "shared workout" OR "group workout" OR "partner workout"
11. Hevy app nutrition calorie tracking request reddit
12. Hevy streak weekly streak feature help
13. Hevy "Hevy Coach" pricing trainers clients
14. Hevy app review "my wife" / "my girlfriend" / "my husband" / "my partner"
15. site:reddit.com r/Hevy girlfriend OR wife OR partner
16. site:reddit.com Hevy pro worth it free limits complaint
17. Hevy trustpilot reviews
18. unstar.app Hevy 1-star complaints
19. Hevy app problems bug sync lost workouts Apple Watch complaints 2025 2026
20. Hevy app Garmin watch support request
21. Hevy feature request board groups challenges clubs
22. Hevy "send workout" Claude ChatGPT finish workout screen 2026
23. Hevy Pro family sharing plan two accounts couple discount
24. Hevy public API Pro required api key
25. Hevy Pro price Canada CAD per year
26. help.hevyapp.com body measurements bodyweight free Pro
27. r/Hevy searches via a Reddit mirror: partner terms; together, gym buddy, group; nutrition, calories, macros, protein; groups; bug, sync, crash (past year); pro, paywall, subscription, price (past year)

## Sources relied on most

- Official: hevyapp.com home, social features page, leaderboard page, ChatGPT app page, Trainer announcement (2026-02-18), July 2026 community update; help.hevyapp.com articles on social, compare, streak, Trainer, body measurements, Family Sharing, Pro sale, Garmin.
- Stores: App Store Canada (CAD IAP prices, v3.1.15 notes), App Store US (USD prices, rating), App Store review pages for US, CA, UK, AU.
- Third party: SensAI (free vs Pro limits, checked Sept 2026), App Pricing Lab, Pulse Signal and RecurDash (price stability), Marlvel (review themes, ranks), Clarity, JustUseApp, GummySearch, Coachway (Hevy Coach), hevy-py README (API needs Pro).
- Community: r/Hevy posts read through a redlib mirror; permalinks converted to reddit.com URLs in the profile.

## Blocked or failed

- hevyapp.com/pricing returned 404; hevy.com/plans rendered no pricing content.
- Google Play listing fetch returned JEFIT twice (wrong app served); Play rating, review count and installs come from App Pricing Lab only.
- iTunes RSS review feed blocked by proxy (403) and robots.txt, so no bulk review pull. Review sample is about 40 App Store reviews in Apple's default ordering, which skews older and positive.
- Reddit direct JSON blocked; one mirror URL needed a permission prompt that timed out. A second mirror worked.
- api.hevyapp.com/docs returned only a title; Trustpilot has no Hevy reviews; AppFollow timed out.

## Could not confirm

- Free tier limits (4 routines, 7 custom exercises, 3 month graphs) come from SensAI and user reviews, not an official Hevy pricing page.
- Why two monthly SKUs exist (USD 2.99 and 3.99; CAD 3.99 and 4.99). Likely a legacy or regional price, not confirmed.
- Public API requiring Pro: single third party source.
- Hevy Coach bracket pricing: single third party source.
- Whether leaderboards and Profile Compare are free; help articles do not say. Assumed free because no Pro gate is mentioned anywhere.
- Review theme shares are rough estimates from a small, non random sample; Josh should spot check 20 reviews per the plan.
- 16M users is Hevy's own claim; 5M Play installs and the #24 Free / #54 Grossing ranks are third party estimates.
