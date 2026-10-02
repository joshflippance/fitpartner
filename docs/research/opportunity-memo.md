# Opportunity Memo: Couples Fitness Tracking

**Date:** 2026-10-02
**Status:** Draft findings for Josh. Options only; the go or no-go choice is Josh's.

> **Public repo note.** This repository is public. This memo contains only sourced public information from the app profiles and logs in this folder. Revisit whether it should move private before adding anything commercially sensitive (see [plan section 10](README.md)).

**Basis:** Desk research only; hands-on testing was descoped. All profiles are `unverified`. The cross-check audited 88 claims: 73 confirmed, 3 corrected, 12 could not be verified ([cross-check](log/cross-check.md)). Prices are list prices from official pages or App Store listings on 2026-10-02; store listings show several SKUs per tier, so treat single figures as indicative.

## Summary

No app in the set gives two people one shared view of nutrition, body weight and training ([phase 1](log/phase-1-discovery.md)). Couples who want that today run two apps each and pay per person: roughly CAD 220 to 240 a year for a pair on common paid combinations (math below). The couples niche is real but split in half: Sweatmates owns couples workout accountability on iOS with a strong ratings signal and no stats by design ([sweatmates](apps/sweatmates.md)), Coupleats does couples nutrition with almost no traction ([phase 1](log/phase-1-discovery.md)), and Fitbod launched a Duo Plan for couples in August 2026 that gives partners no shared view ([fitbod](apps/fitbod.md)). Explicit user demand is thin: the review samples for the eight mainstream apps held almost no partner requests, except Cronometer's forum, where 8 sources from 2018 to 2025 ask for shared meals or diaries ([cronometer](apps/cronometer.md)). Overall evidence strength is **low to moderate**: strong that the gap exists, weak that enough couples will pay to fill it. The cheapest next step is a small couples beta of the existing PWA, which is useful whichever option Josh picks.

## The segment

**Who:** two people in one household, typically partners, who both track food and train, want to see each other's progress, and want to log a shared dinner once. Evidence: Cronometer couples asking to share diaries and meals ([cronometer](apps/cronometer.md)); Sweatmates reviews, where nearly every positive review is about a couple ([sweatmates](apps/sweatmates.md)); Hevy users asking which calorie app to pair with it ([hevy](apps/hevy.md)).

**What they use today:** one lifting app plus one nutrition app per person, or Sweatmates for accountability only. No app covers both halves for two people ([phase 1](log/phase-1-discovery.md)).

**What it costs a couple today** (annual plans, two separate subscriptions unless noted):

| Combination | Math | Annual cost for two | Currency | Source |
|---|---|---|---|---|
| Hevy free + Cronometer free | 0 + 0 | 0, with ads in Cronometer | n/a | [hevy](apps/hevy.md), [cronometer](apps/cronometer.md) |
| Hevy Pro only (lifting) | 31.99 x 2 | 63.98 | CAD | [hevy](apps/hevy.md) |
| Cronometer Gold only (nutrition) | 79.99 x 2 | 159.98 | CAD | [cronometer](apps/cronometer.md) |
| Hevy Pro + Cronometer Gold | (31.99 + 79.99) x 2 | 223.96 | CAD | [hevy](apps/hevy.md), [cronometer](apps/cronometer.md) |
| Strong PRO + MyFitnessPal annual (lower CAD SKU, tier mapping unconfirmed) | (39.99 + 69.99) x 2 | 219.96 | CAD | [strong](apps/strong.md), [myfitnesspal](apps/myfitnesspal.md) |
| MacroFactor bundle (Nutrition + Workouts) | 119.99 x 2 | 239.98 | CAD | [macrofactor](apps/macrofactor.md) |
| JEFIT Elite only (CAD not cross-checked) | 88.99 x 2 | 177.98 | CAD | [jefit](apps/jefit.md) |
| Fitbod Duo Plan (lifting only, one bill) + Cronometer Gold x 2 | 159.99 + (59.99 x 2) | 279.97 | USD | [fitbod](apps/fitbod.md), [cronometer](apps/cronometer.md) |
| Sweatmates (accountability only) | about 40 per year per reviewers; whether it covers both partners is unknown | about 40 to 80 | USD | [sweatmates](apps/sweatmates.md) |

Takeaway: a couple paying for both halves spends about CAD 220 to 240 a year, and still gets no shared view. A couple paying for one half spends about CAD 64 to 182. A couple willing to tolerate ads and limits can pay nothing.

## Evidence for and against demand

### For

| Signal | Strength | Source |
|---|---|---|
| 8 Cronometer sources (7 forum threads 2018 to 2025, 1 App Store review) ask for shared meals, diary visibility, or one household price; none shipped. Staff said a family plan with easier food sharing would be great | Moderate: repeated over years, but small absolute numbers | [cronometer](apps/cronometer.md) |
| Fitbod launched a Duo Plan (August 2026) marketed at couples or workout partners | Moderate: a large company betting on couples as a buyer, though it chose no shared view | [fitbod](apps/fitbod.md) |
| Sweatmates: 13,076 US ratings at 4.91 within about nine months of launch; about 40% of the written sample praises couples working out more consistently | Moderate to strong for couples accountability; says nothing about nutrition | [sweatmates](apps/sweatmates.md) |
| A r/Hevy post wishing for a nutrition version drew about 105 upvotes; several threads ask which calorie app to pair with Hevy | Weak to moderate: wants both halves, not necessarily for couples | [hevy](apps/hevy.md) |
| Group and club requests on r/Hevy (84, 44, 39 and 5 upvotes) | Weak: groups, not pairs | [hevy](apps/hevy.md) |
| Listicles targeting the query "calorie tracker for couples" | Weak: vendor content marketing | [phase 1](log/phase-1-discovery.md) |

### Against

| Signal | Source |
|---|---|
| 0 explicit partner or couples requests in about 60 Fitbod, about 40 Hevy, about 24 JEFIT, the Strong sample, the MyFitnessPal samples, the MacroFactor sample and about 20 Lose It! reviews | [fitbod](apps/fitbod.md), [hevy](apps/hevy.md), [jefit](apps/jefit.md), [strong](apps/strong.md), [myfitnesspal](apps/myfitnesspal.md), [macrofactor](apps/macrofactor.md), [lose-it](apps/lose-it.md) |
| Partner requests are about 2% of Cronometer store reviews; the volume sits in its forum | [cronometer](apps/cronometer.md) |
| Sweatmates buyers seem to choose it because it has no stats; no review in the sample asks for nutrition, weight or lifting detail | [sweatmates](apps/sweatmates.md) |
| Coupleats, the only couples nutrition app found, has 12 US ratings after launching in May 2026 | [phase 1](log/phase-1-discovery.md) |
| Fitbod, with couples as a stated buyer, still chose to keep partner data private | [fitbod](apps/fitbod.md) |
| GymRats: 1 spouse mention in about 60 reviews; friend and office groups dominate | [gymrats](apps/gymrats.md) |

**Caveats on both sides:** Reddit was blocked, so community volume is under counted ([phase 1](log/phase-1-discovery.md)). Review samples are small and skewed by store ordering. Absence of a request is not proof of absence of demand.

**Overall evidence strength: low to moderate.** The supply gap is well documented. Demand for a combined couples product is inferred from adjacent signals, not observed directly, and willingness to pay is untested.

## Competitive landscape: closest threats

| Threat | What it has | What it lacks | If it added the missing half |
|---|---|---|---|
| **Sweatmates** ([sweatmates](apps/sweatmates.md)) | Couples positioning, weekly goal per partner, instant check-ins, nudges, Pinky Promise, rewards, widget; ships about every two weeks; 13K US ratings | Nutrition, weight, sets and reps (by design); Android; a free tier | Highest risk. A simple calorie or weight check-in would cover most of FitPartner's pitch for iPhone couples, backed by an existing audience. Its no-stats identity may make it reluctant, and its buyers have not asked |
| **Coupleats** ([phase 1](log/phase-1-discovery.md)) | Side by side calorie and macro rings, copy shared meals, nudges, weekly sync report, couple streaks, private weight by default | Workouts and lifting; Android; scale (12 ratings) | Would become the closest feature match to FitPartner. Low audience today, so the risk is a well built direct competitor rather than a distribution threat |
| **Fitbod Duo** ([fitbod](apps/fitbod.md)) | Couples billing, strong lifting product, large user base (15M+ downloads, company claim) | Any shared view; nutrition | If Fitbod turned on partner visibility, it would own lifting for couples with a far bigger audience. Nutrition would still be missing, so couples would still need a second app |
| GymRats (lower) ([gymrats](apps/gymrats.md)) | Free two-person groups, cross platform, new Train tab (September 2026) | Cooperative goal, nutrition, weight | A cooperative mode plus nutrition would raise the threat; its base is concentrated in Brazil and in groups |

## Positioning options

| Option | Statement | Strengths | Trade-offs |
|---|---|---|---|
| **A. The whole picture for two** | One shared app for a couple's food, protein, weight and training, so neither of you needs two apps. | Owns the documented gap no competitor covers; clear price story against two subscriptions each | Must match category basics on both halves (food database, set logging), which is the most build; competes with specialists on depth |
| **B. Log once, eat together** | The nutrition tracker built for couples who share meals: log dinner once, both diaries update, see each other's day. | Rests on the strongest direct evidence (Cronometer forum); smaller build than A | Coupleats already claims this angle; nutrition apps compete on database quality, a weak spot today |
| **C. Results, not just attendance** | Couples accountability with real numbers: the shared weekly streak plus the calories, protein and weight behind it. | Uses the mechanic Sweatmates validated, adds the depth it skips; FitPartner already has most of it | Positions directly against the strongest couples app; Sweatmates buyers may not want numbers |

## Pricing options

Benchmarks: Hevy Pro CAD 31.99 a year per person, Strong CAD 39.99, GymRats CAD 44.99, Cronometer Gold CAD 79.99, MacroFactor CAD 90.99 per app, Sweatmates about USD 40 a year, Coupleats Plus USD 49.99 a year, Fitbod Duo USD 159.99 for two ([hevy](apps/hevy.md), [strong](apps/strong.md), [gymrats](apps/gymrats.md), [cronometer](apps/cronometer.md), [macrofactor](apps/macrofactor.md), [sweatmates](apps/sweatmates.md), [phase 1](log/phase-1-discovery.md), [fitbod](apps/fitbod.md)). Price points below are options to test, not findings.

| Model | Illustrative price | Benchmark logic | Trade-offs |
|---|---|---|---|
| **1. Free core plus couples plan** | Free pairing and logging; one couples plan around CAD 49.99 to 79.99 a year for both | Under one Cronometer Gold (CAD 79.99) and far under two; in the Sweatmates and Coupleats range | Directly answers the paywall complaints at Sweatmates, MacroFactor, MyFitnessPal and Lose It!; needs a clear premium line (history, recaps, food search) and slows revenue |
| **2. Per-couple subscription with trial, no free tier** | Around CAD 59.99 to 99.99 a year per couple, monthly option, trial terms shown up front | Under two Hevy Pros (CAD 63.98) at the low end; well under the CAD 220 to 240 paid two-app combos at the high end | Simplest to run; repeats the hard paywall pattern that is Sweatmates' biggest complaint and MacroFactor's most common one ([sweatmates](apps/sweatmates.md), [macrofactor](apps/macrofactor.md)) |
| **3. One payer unlocks both** | Partner joins free; one person pays about CAD 31.99 to 44.99 a year | Matches Hevy Pro and GymRats Pro per-person pricing, but covers two | Lowest friction to pair; lowest revenue per couple; behaves like a household plan without the label |

## Go or no-go options

| Option | What it requires | Cost | Risk | Signal that would justify it |
|---|---|---|---|---|
| **1. Keep it personal** | Keep building for Josh and April; use the backlog Now items | Josh's evenings only | Low. Opportunity cost if Sweatmates or Coupleats close the gap first | Beta (below) shows other couples drop off, or no one outside the household would pay |
| **2. Validate with a lightweight test** | Run the couples beta below, plus optionally a simple landing page to collect couples sign ups | A few weeks of part-time effort; existing hosting (not costed here) | Low. Small samples give directional answers only | Beta meets the threshold below, giving a reason to choose option 3 |
| **3. Build toward public launch** | Food database, set logging, billing for couples, privacy and terms, App Store presence or PWA marketing, support | Months of build plus ongoing costs for food data, billing and hosting (not costed here) | Medium to high. Demand evidence is low to moderate; Sweatmates has distribution and fast shipping; Fitbod could add a shared view | Beta threshold met, and a meaningful share of beta couples accept a stated couples price |

### Cheapest next validation test (useful under every option)

**Couples beta of the existing PWA.** Invite 10 couples from Josh's own network to use FitPartner as it is for 4 weeks. At the end, show each couple one stated couples price from the pricing options above and ask if they would pay it.

**Proposed success threshold:**
- At least 6 of 10 couples have **both** partners logging in at least 3 of the 4 weeks.
- At least 4 of 10 couples say yes to the stated price.
- Ask each couple which second app they would drop; at least half naming one supports the "replace two apps" story.

Below the threshold points toward option 1. At or above points toward option 3. The choice stays with Josh.

## Risks and unknowns

1. **Demand is inferred, not observed.** Explicit couples requests are rare outside the Cronometer forum ([cronometer](apps/cronometer.md)).
2. **Sweatmates could add the missing half** and already has the audience and shipping pace ([sweatmates](apps/sweatmates.md)).
3. **Category table stakes are expensive.** A food database and fast set logging are what users praise in the leaders; FitPartner has neither ([hevy](apps/hevy.md), [myfitnesspal](apps/myfitnesspal.md)).
4. **Single-app churn risk doubles.** If one partner stops, the shared streak and the couples subscription likely stop too. Untested.
5. **Privacy inside a couple.** Visible weight and food can create friction; Coupleats and Hevy keep weight private ([phase 1](log/phase-1-discovery.md), [hevy](apps/hevy.md)).
6. **PWA limits.** Reminders, widgets and App Store discovery are weaker than native; Sweatmates leans on a widget and iOS features ([sweatmates](apps/sweatmates.md)).
7. **Unverified competitor facts.** Whether a Sweatmates subscription covers both partners, what a Fitbod Duo member sees, and what MyFitnessPal friends see are all open ([cross-check](log/cross-check.md)).
8. **Pricing drifts.** Lose It! appears to have doubled its list price in 2026 (unverified) and store listings carry many SKUs ([lose-it](apps/lose-it.md), [cross-check](log/cross-check.md)).
9. **Reddit not searched.** Community demand may be larger or smaller than shown ([phase 1](log/phase-1-discovery.md)).
10. **No hands-on timing data.** Research question 1 (taps and seconds) is unanswered, so speed claims against competitors are unproven.
