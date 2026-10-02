# Cross-check audit of app profiles

**Date:** 2026-10-02
**Reviewer:** independent cross-check agent (did not write the profiles)
**Scope:** the 10 profiles in `docs/research/apps/`. Priority claims: headline pricing, partner or shared progress, free vs paywall, AI features, numbers presented as fact, format rules.
**Method:** WebFetch of the cited official page, help article or App Store listing for each claim. WebSearch budget for the session was already used up, so no new sources were discovered; every check is against a source the profile already cites (or the official page it should cite).

Result key: **Confirmed** (source says the same), **Corrected** (source contradicts or adds a material fact; profile edited and tagged `(corrected in cross-check)`), **Could not verify** (source blocked, missing, or only third party).

## Format check (all 10 profiles)

| Rule | Result |
|---|---|
| No em or en dashes | Confirmed. None found in any profile. |
| Quotes 10 words or under | Confirmed. Longest quoted string is 8 words (Sweatmates, a FitPartner concept line, not a source quote). |
| At most one quote per source | Confirmed. Direct source quotes are taglines or short labels (for example Fitbod "Less planning. More progress.", Strong "Think less. Lift more."), one per source. Most other quoted strings are UI labels or FitPartner phrasing. |
| Status field present | Confirmed in all 10. All remain `unverified`; a `**Cross-check:**` line was added under each. |

## Fitbod

| Claim | Profile said | Result | Source checked |
|---|---|---|---|
| USD price | 15.99 per month, 95.99 per year | Confirmed | help.fitbod.me article 30542136101527 |
| Trial and paywall | 7-day trial, must pick a plan, past workouts viewable, new logging needs a subscription | Confirmed | Same help article |
| Duo and Family price | Duo 159.99 per year for 2, Family 359.99 per year for up to 5, annual only, bought on web | Confirmed | app.fitbod.me/family; help article 42280653162519 |
| Partner visibility | Separate accounts, members cannot see each other's data; Duo marketed at couples | Confirmed. Both pages say each person has their own history and progress; Duo copy names couples or workout partners. | Same two pages |
| Share workout link | Same exercises, retailored per recipient; no custom exercises; gym profiles shareable | Confirmed | help article 360006427453 |
| AI features | Proprietary algorithm, 150M+ workouts, no LLM or chat | Confirmed | fitbod.me AI blog post (2026-01-20) |
| Company scale claims | 15M+ downloads, 120M+ logged workouts, HSA/FSA | Confirmed (company claims, labelled as such) | fitbod.me |
| CAD price tiers | Several CAD SKUs; current tier mapping unverified | Could not verify. Not refetched; profile already flags it. | n/a |

## Hevy

| Claim | Profile said | Result | Source checked |
|---|---|---|---|
| USD prices | 2.99 or 3.99 monthly, 23.99 yearly, 74.99 lifetime | Confirmed | App Store US |
| CAD prices | 3.99 or 4.99 monthly, 31.99 yearly, 104.99 lifetime | Confirmed | App Store Canada |
| Free tier limits | 4 routines, 7 custom exercises, 3 months graph history | Confirmed against cited source, but that source is third party (SensAI, a competitor). | sensai.fit Hevy review 2026 |
| Profile Compare | Workouts, duration, volume, muscle split, shared PRs; 30 days to all time; 13 lifts for exercise compare | Confirmed | Hevy help, compare progress with friends |
| Leaderboards | 38 lifts, ranked among followed users only | Confirmed | hevyapp.com gym leaderboard page |
| Weight visibility | Body measurements and photos private to owner; weight and waist free | Confirmed. This is the key limit on what a partner can see. | Hevy help, body measurements |
| Hevy Trainer | Algorithm, not AI; Pro only | Confirmed | Hevy help, Trainer explained |
| AI hand off | v3.1.15 sends workouts to ChatGPT or Claude | Confirmed | App Store US release notes |
| User claim | 16M+ users, company claim | Confirmed | hevyapp.com |
| Public API needs Pro | Pro only (unverified) | Could not verify. Not checked against official API docs. | n/a |

## Strong

| Claim | Profile said | Result | Source checked |
|---|---|---|---|
| CAD prices | 6.49 month, 24.99 six months, 39.99 year, 129.99 lifetime | Confirmed | App Store Canada |
| USD prices | 4.99, 19.99, 29.99, 99.99 | **Corrected.** US listing also shows alternate SKUs of 3.99 per month and 79.99 lifetime. Added to profile. | App Store US |
| Free template limit | 3 templates | Confirmed | Strong help, about templates |
| PRO feature list | No CSV export in official list | Confirmed | Strong help, What is Strong PRO |
| AI features | None | Confirmed | App Store Canada listing |
| Sharing | One way share sheet link, recipient needs Strong, improvements promised with no date; no friends or feed | Confirmed | Strong help, share workout or template |
| Release year of 6.5.0 | Year varies by source | Could not verify definitively. The US listing fetched today dates 6.5.0 to Aug 12, 2025, which conflicts with the third party 2026 claim. Profile already hedges; left as is. | App Store US |

## JEFIT

| Claim | Profile said | Result | Source checked |
|---|---|---|---|
| USD price | 12.99 month, 69.99 year | Confirmed | jefit.com/elite; Google Play |
| Elite benefits | Plans, analytics, watch, videos, ad free | Confirmed | jefit.com/elite |
| Free tier per JEFIT | No ads, no time limit, 27,000+ plans, 7 custom exercises, 13M+ users | Confirmed. Conflict with Elite page listing ad free as a benefit remains, as the profile says. | jefit.com blog, Jefit vs Caliber |
| Compare records | Private compare of 1RM and workout time against friend list, 2021 | Confirmed. Covers total workout time plus bench, squat and deadlift 1RM. | jefit.com blog, compare records (2021-11-19) |
| Google Play listing | 5M+, updated 2026-09-15, Wear OS live sync | Confirmed. Page returned the correct app. | play.google.com je.fit |
| Newsfeed exists | Social newsfeed | Confirmed (release notes mention a privacy label on private newsfeed posts) | Google Play |
| CAD prices | 16.49 month, 88.99 year | Could not verify. App Store Canada fetch was rate limited (HTTP 429). | n/a |
| AI positioning | "AI-powered" adaptive plan; Mesocycle not called AI | Could not verify. Not refetched within budget. | n/a |

## MyFitnessPal

| Claim | Profile said | Result | Source checked |
|---|---|---|---|
| USD prices | Premium 79.99 per year; Premium+ 99.99 per year or 24.99 per month | Confirmed | myfitnesspal.com/premium |
| CAD in-app prices | Monthly 13.99 and 27.99, annual 69.99 and 114.99 | Confirmed. Note: the listing labels may tie 27.99 to a 3-month SKU; the profile already says tier mapping is not shown. | App Store Canada |
| Barcode scan paywalled | Premium only | Confirmed | myfitnesspal.com/premium |
| AI Coach | July 2026, Premium, US, UK, CA, AU, NZ | Confirmed. Canada listing also advertises an AI Nutrition Coach. | Healthcare Technology Report |
| Cal AI acquisition | March 2026 | Confirmed (2026-03-02) | Fitt Insider |
| Downloads and revenue | 900K monthly downloads, US$13M monthly revenue, per Fitt Insider | **Corrected.** Fitt Insider attributes these to Sensor Tower. Attribution added so it reads as a third party estimate. | Fitt Insider |
| Premium monthly | US$19.99 per two third party reviews | Could not verify. Official page shows no Premium monthly price. Profile already labels the source. | myfitnesspal.com/premium |
| Friends diary privacy | Public, friends only, private; friends can view and copy meals | Could not verify. Official help article URL returned 404 and search budget was exhausted. This is the partner claim and stays third party only. | n/a |

## MacroFactor

| Claim | Profile said | Result | Source checked |
|---|---|---|---|
| USD per app | 11.99 month, 47.99 six months, 71.99 year | Confirmed | macrofactor.com/workouts/price; help article 393 |
| Bundle | 89.99 per year | Confirmed | Same |
| Legacy offer | Workouts free until 2027-01-12 for pre 2026 subscribers | Confirmed | Same |
| CAD Nutrition | 15.49, 59.99, 90.99 | Confirmed | App Store Canada, Nutrition |
| CAD Workouts | 14.99, 59.99, 99.99, bundle 119.99 (flagged unverified) | Confirmed. The listing shows these exact figures, so the mismatch with Nutrition is real, not a fetch error. Profile wording left as is. | App Store Canada, Workouts |
| Free tier | None, 7-day trial | Confirmed | App Store Canada, Nutrition |
| Partner features | None; only recipe and custom food share by deep link, framed for friends or family | Confirmed | help article 114 |
| Scale and AI | 600K users Sept 2026 (400K in 2025); Plate Stack AI; Wear OS actively exploring | Confirmed (company claims) | Annual report 2026 |
| AI photo logging | Launched April 2025 | Could not verify. Not refetched within budget. | n/a |

## Cronometer

| Claim | Profile said | Result | Source checked |
|---|---|---|---|
| Gold USD | 10.99 month, 59.99 year | Confirmed | cronometer.com/gold |
| Gold CAD | 14.99 month, 79.99 year | Confirmed | App Store Canada |
| Gold features | Photo Log, Voice Log, Crono Coach, sharing custom foods and recipes with friends, and others | Confirmed | cronometer.com/gold |
| No household plan | None | Confirmed (no mention on Gold page) | cronometer.com/gold |
| Separate accounts, no joint view | Staff confirmed | Confirmed. Staff reply (June 2020) says each person needs a separate account; sharing is foods and recipes only. | forums.cronometer.com comment 11985 |
| Crono Coach | 2026-07-28, Gold, web/iOS/Android, not a chatbot | Confirmed | Cronometer blog, Crono Coach |
| Free tier ads | Ads shown | Confirmed | Cronometer support, Basic account |
| Barcode scanner free | Listed in free tier | Could not verify. The official Basic account article does not mention the scanner either way; the claim rests on the cited blog posts. | Cronometer support, Basic account |

## Lose It!

| Claim | Profile said | Result | Source checked |
|---|---|---|---|
| Premium price | 79.99 per year | Confirmed | Lose It! help, tiers and pricing (updated 2026-09-09) |
| Lifetime | 299.99, or 229.99 for Premium members | Confirmed | Same |
| Barcode scanner transition | Moving to Premium, some free users keep access for now | Confirmed | Lose It! help, unlocking the barcode scanner |
| Label scanner | Also moving to Premium | Confirmed | Same |
| One user per subscription | No family sharing | Confirmed | Lose It! help, Apple Family Share |
| Friends | Add by email; help center does not say what friends see | Confirmed | Lose It! help, add and accept friends |
| US store prices | Premium 9.99 to 79.99, Lifetime 49.99 to 59.99 | Confirmed. Listing also shows a separate "Premium Features" item at 39.99. | App Store US |
| Support groups, voice and photo logging | Listed in App Store description | Confirmed | App Store US |
| Price doubled in 2026 | From 39.99 to 79.99 per third party reviews | Could not verify. Third party only; profile already labels it unverified. | n/a |

## Sweatmates

| Claim | Profile said | Result | Source checked |
|---|---|---|---|
| Store metadata | v1.4.3 on 2026-09-28, first release 2025-12-21, 4.91 from 13,076 ratings, KnightCollar LLC | Confirmed | iTunes lookup API |
| Paywall | Workout logging requires a subscription | Confirmed | App Store US description |
| USD SKUs | 4.99, 7.99, 19.99, 29.99, 39.99, 44.99, 59.99 | Confirmed (several duplicate SKUs at the same prices) | App Store US |
| CAD SKUs | 2.99, 6.99, 9.99, 39.99, 49.99, 79.99; CA 4.7 from 90 | Confirmed | App Store Canada |
| Partner view | Photo check-in partner sees instantly; see each other's weekly progress | Confirmed | App Store US description; iTunes lookup |
| Comments on check-ins | Marked unverified | **Corrected.** The listing description says partners can leave comments on photos. Unverified tag replaced. | App Store US |
| Partner mechanics by version | Nudges May, Pinky Promise June, Treat Yourself July, custom wagers Jul to Aug, Lock In Mode 1.4.3 (also seen on 1.1.9), widget Feb, gym reminders Apr | Confirmed | App Store US version history |
| No stats | No nutrition, weight or sets | Confirmed ("no stats or tracking required" in description) | iTunes lookup |
| One subscription covers both | Not stated | Could not verify. No source says. Highest priority for Phase 4. | n/a |
| 100K+ downloads | Third party estimate | Could not verify. Single third party source (MWM), already labelled. | n/a |

## GymRats

| Claim | Profile said | Result | Source checked |
|---|---|---|---|
| Free tier | Unlimited participants, at most 2 active groups, ads | Confirmed | gymrats.app/pricing |
| USD Pro | 3.99 month, 32.99 year | Confirmed | gymrats.app/pricing |
| CAD Pro | 4.99 month, 44.99 year; 645 ratings at 4.8 | Confirmed | App Store Canada |
| Pro features | Unlimited groups, ad free, Rat Pack, video, themes, scoring limits, moderators, export | Confirmed | gymrats.app/pricing |
| Scoring modes | Days Active, Total Check-in Count, Hustle Points, Metrics | Confirmed | GymRats help, scoring modes |
| Sept 2026 redesign | Home feed of friends, Train tab, routines, haptic per set, exercise reorder | Confirmed | App Store US version history; App Store Canada |
| Pro personal stats | Added Dec 2025 | Confirmed (2025.11.29, released Dec 1) | App Store US version history |
| Google Play | 4.9 from about 111K, 1M+, updated 2026-09-15 | Confirmed. Page returned the correct app. | play.google.com com.hasz.gymrats.app |
| AI features | None | Confirmed | App Store Canada |
| Shared goal | No mode where a period counts only if both hit it | Confirmed (no such mode among the four scoring modes) | GymRats help, scoring modes |

## Totals

| App | Confirmed | Corrected | Could not verify |
|---|---|---|---|
| Fitbod | 7 | 0 | 1 |
| Hevy | 9 | 0 | 1 |
| Strong | 5 | 1 | 1 |
| JEFIT | 6 | 0 | 2 |
| MyFitnessPal | 5 | 1 | 2 |
| MacroFactor | 8 | 0 | 1 |
| Cronometer | 7 | 0 | 1 |
| Lose It! | 8 | 0 | 1 |
| Sweatmates | 8 | 1 | 2 |
| GymRats | 10 | 0 | 0 |
| **Total** | **73** | **3** | **12** |

## Systemic issues

1. **The partner claim held up everywhere it could be checked.** No profile overstated what two people can see of each other. The main gap is MyFitnessPal, where the friends and diary privacy claim rests only on a third party blog because the official help page returned 404.
2. **Absence claims are hard to prove from documentation.** "No partner feature" is confirmed only in the sense that official pages describe none. Phase 4 is the real test.
3. **App Store listings show several SKUs per tier** (Strong, Hevy, MyFitnessPal, Sweatmates, Lose It!) with no label saying which a new subscriber sees. Profiles that list only one set of prices can look wrong. Treat official pricing pages as the headline and store SKUs as ranges.
4. **Rate limiting.** The App Store Canada page for JEFIT returned HTTP 429, so JEFIT CAD prices are unchecked. Plan retries or a manual check.
5. **Search budget was exhausted** before this pass, so no fresh sources could be found for claims with only third party backing.
6. **Google Play pages returned the correct apps** for JEFIT and GymRats in this pass. The earlier concern about wrong app pages did not reproduce for these two; other Play figures in the profiles still come from third party trackers (AppPricingLab, AppBrain) and are labelled as such.
7. **Reddit was not used as a check source.** Profiles relied on mirrors or third party roundups; review theme shares remain directional estimates and were not audited.
8. **Third party estimates are mostly labelled correctly.** The one miss was MyFitnessPal download and revenue figures, which needed the Sensor Tower attribution.

## Five claims for Josh to verify by hand in Phase 4

1. **Sweatmates: does one subscription cover both partners, and what exactly does each partner see?** No source answers this, and it is the closest competitor to FitPartner's core promise.
2. **MyFitnessPal: what a friend can see of your diary and weight**, and whether the newsfeed is gone. Official help page was unreachable; this sets the bar for the largest nutrition app.
3. **Hevy: Profile Compare in practice**, confirming that a followed partner sees workouts but not bodyweight, and whether compare is free.
4. **Fitbod Duo: that the second member truly sees nothing of the first**, since this is the headline "sold for couples but no shared view" contrast in positioning.
5. **Free tier logging on Cronometer and Lose It!**: whether barcode scanning is free on a new Cronometer account and already locked on a new Lose It! account. Both feed the "keep core logging free" argument.
