# FitPartner Competitive Research Plan

**Owner:** Josh Flippance
**Status:** Plan approved for setup, research not started
**Started:** 2026-10-02

## 1. Purpose

One research effort, three outputs:

| Output | Question it answers | File |
|---|---|---|
| Backlog inputs | What should FitPartner borrow, beat, or skip? | `backlog-inputs.md` |
| Opportunity memo | Is "couples fitness tracking" a real, unserved segment worth taking public? | `opportunity-memo.md` |
| Portfolio case study | How does an AI-augmented PM run competitive research at 10x speed? | `case-study.md` |

Shared evidence lives in `feature-matrix.md` and `apps/<app>.md`. Every output cites it.

## 2. Competitor set

| Slot | Category | App |
|---|---|---|
| 1 | Lifting | Fitbod |
| 2 | Lifting | Hevy |
| 3 | Lifting | Strong |
| 4 | Lifting | JEFIT |
| 5 | Nutrition | MyFitnessPal |
| 6 | Nutrition | MacroFactor |
| 7 | Nutrition | Cronometer |
| 8 | Nutrition | Lose It! |
| 9 | Social / partner | TBD in Phase 1 |
| 10 | Social / partner | TBD in Phase 1 |

**Slots 9 and 10 selection rule:** apps where two or more people share goals, progress, or accountability. Prefer one couples-specific app and one broader accountability app. Candidates go to Josh for approval before Phase 2.

## 3. Research questions

**Backlog**
1. How many taps and seconds does it take to log a meal, a workout, and a weigh-in?
2. Which features drive daily return (streaks, reminders, widgets, social nudges)?
3. What do users complain about most in reviews?
4. Where does each app use AI, and does it actually save effort?

**Opportunity**
5. Does any top app support a real two-person shared view? How deep does it go?
6. What do the apps charge, what sits behind the paywall, and where do they draw the free line?
7. How often do reviews and community threads mention partners, spouses, or training together?
8. What would a couples product need to be worth paying for over two separate subscriptions?

**Case study**
9. Which research steps did AI speed up, and by how much?
10. Where did AI get it wrong, and how was that caught?

## 4. Evaluation framework

Each app is scored 0 to 3 per dimension in `feature-matrix.md`.

| Score | Meaning |
|---|---|
| 0 | Absent |
| 1 | Present but weak or buried |
| 2 | Solid, on par with category |
| 3 | Best in class |

**Dimensions**

| Group | Dimension |
|---|---|
| Logging | Meal logging speed |
| | Food database quality and barcode scan |
| | Workout logging speed |
| | Weight logging and trend |
| Guidance | Calorie and macro targets (static vs adaptive) |
| | Workout programming and progression |
| | AI features (meal photo, plan generation, coaching) |
| Engagement | Streaks and habit mechanics |
| | Reminders, widgets, watch support |
| | Progress views and history |
| Shared | Partner or friend linking |
| | Shared dashboard or real-time view |
| | Group challenges and accountability |
| Business | Free tier generosity |
| | Price and plan structure |
| | Platforms (iOS, Android, web) |

## 5. Methods

| Method | What it produces | Who |
|---|---|---|
| Desk research | Pricing, paywall map, feature list, recent changelog, platforms | AI agents, one per app, in parallel |
| Review mining | Top praise and complaint themes, partner/couple mentions | AI agent clusters recent App Store and Google Play reviews; Josh spot-checks 20 per app |
| Community scan | Unprompted pain points from Reddit and forums | AI agent; Josh verifies quotes and links |
| Hands-on trial | Timed task results, onboarding notes, screenshots | Josh and April on their own phones |
| Synthesis | Scores, gaps, opportunity call | AI drafts, Josh decides |

**Timed task protocol (hands-on)**

Run on a fresh install, free tier unless noted. Record taps and seconds.

1. Sign up through to the first usable screen
2. Log a known meal (chicken breast 200 g, 1 cup rice)
3. Log a 3-exercise workout (bench, squat, row; 3x5 each)
4. Log today's weight
5. Find a partner or friend feature and connect the second account
6. See both people's progress for today

**Verification rules**
- Every factual claim (price, feature, limit) needs a source link and a checked date.
- AI-collected claims are marked `unverified` until Josh or a second source confirms.
- No numbers that require paid market data. Download or revenue estimates are labelled as estimates with source.

## 6. AI-augmented workflow (case study evidence)

1. **Parallel desk research:** one agent per app fills the `apps/<app>.md` template.
2. **Review clustering:** an agent groups reviews into themes with counts and example quotes.
3. **Cross-check pass:** a separate agent that did not do the research audits each profile against its sources.
4. **Human gate:** Josh confirms scores and the slot 9 and 10 picks.
5. **Time log:** record clock time per phase and an estimate of manual effort for comparison in `case-study.md`.

Keep prompts and agent outputs in `docs/research/log/` so the process is reproducible.

## 7. Phases

| Phase | Work | Output | Effort |
|---|---|---|---|
| 1. Discovery | Confirm the 8 named apps, propose slots 9 and 10 | Approved list | 1 session |
| 2. Desk research | Profiles for all 10 apps | `apps/*.md` | 1 session (parallel agents) |
| 3. Review and community mining | Themes, partner mentions | Section in each profile | 1 session |
| 4. Hands-on trial | Timed tasks with April | Results table in each profile | 2 to 3 evenings |
| 5. Scoring | Fill the matrix | `feature-matrix.md` | 1 session |
| 6. Synthesis | Backlog inputs, opportunity memo | `backlog-inputs.md`, `opportunity-memo.md` | 1 session |
| 7. Case study | Process write-up with time savings | `case-study.md` | 1 session |

Phase 4 is the only one needing both of you. Phases 2 and 3 can run while Phase 4 is scheduled.

## 8. File structure

```
docs/research/
  README.md              this plan
  feature-matrix.md      scores, 10 apps x 16 dimensions
  apps/
    _template.md         profile template
    fitbod.md ...        one per app
  backlog-inputs.md      borrow / beat / skip
  opportunity-memo.md    segment, pricing, go or no-go
  case-study.md          AI-augmented process write-up
  log/                   prompts, agent outputs, time log
```

## 9. Risks and constraints

- **Public repo.** Everything here is visible. Keep opinions about real companies factual and sourced. Move the opportunity memo private if it gets commercially sensitive.
- **Trial limits.** Some features sit behind paid tiers or trials. Note when a score is based on marketing material rather than hands-on use.
- **Recency.** App features and pricing change often. Every profile carries a "checked on" date.
- **Sample bias.** Two users testing is directional, not statistical. Review mining provides the volume.

## 10. Open decisions

| Decision | Status |
|---|---|
| Slots 9 and 10 | Pending Phase 1 |
| Paid trials to start (which apps, budget) | Pending |
| Opportunity memo stays public or moves private | Revisit after Phase 6 |
