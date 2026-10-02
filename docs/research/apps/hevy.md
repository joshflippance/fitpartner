# Hevy

**Category:** Lifting
**Checked on:** 2026-10-02
**Platforms:** iOS / Android / Web / Watch (Apple Watch and Wear OS; no Garmin)
**Status:** unverified
**Cross-check:** 2026-10-02, 9 confirmed, 0 corrected, 1 unverifiable

## Snapshot

| Field | Value | Source |
|---|---|---|
| Positioning (one line) | Free, ad free gym workout logger with a social feed; markets itself as the top free workout tracker and claims 16M+ users. | [1], [2] |
| Free tier includes | Unlimited workout logging, 4 routines, 7 custom exercises, 3 months of graph history, bodyweight and waist tracking, Apple Watch and Wear OS apps, full social feed, follows, comments, leaderboards, compare with friends, weekly streak, ChatGPT plugin. No ads. | [3], [4], [8], [10], [11], [12] |
| Paid plans and price (CAD/USD) | Hevy Pro. Canada App Store: CAD 3.99 or 4.99 per month (two SKUs listed), CAD 31.99 per year, CAD 104.99 lifetime. US: USD 2.99 or 3.99 per month, USD 23.99 per year, USD 74.99 lifetime. 50% off first year for new subscribers a few times a year; lifetime never discounted. No Family Sharing and no couple or duo plan: a second person must buy a separate subscription on hevy.com. Separate B2B product Hevy Coach for trainers, from USD 25 per month for up to 10 clients (unverified). | [5], [2], [6], [13], [14], [21] |
| Key paywalled features | Unlimited routines and custom exercises, all time graph history, body fat percentage and full body circumferences, Hevy Trainer program generator, public API access (unverified). | [3], [8], [9], [15] |
| AI features | No native generative AI. Hevy Trainer (Pro, launched 2026-02-18) is explicitly rules based: Hevy's help center says programs come from an algorithm and do not rely on AI; it uses double progression to suggest weight increases. AI is outsourced: a free ChatGPT app plugin (tag @hevy to analyze history, generate programs, save routines back), and since v3.1.15 (Sept 2026) a button on the finish workout screen sends the workout to ChatGPT or Claude for feedback. Third party MCP servers exist for the public API. | [7], [8], [9], [16], [2], [17] |
| Partner / friend / group features | One way follow model (private profiles need approval). Home feed of followed users plus Discover feed, likes, comments, photo or video on workouts. Profile Compare: side by side workouts, duration, volume, muscle split, shared PRs over 30 days to all time. Exercise Compare on 13 lifts. Leaderboards on 38 lifts ranked only among people you follow. Shareable routine and folder links. Strava sync. No groups, clubs, challenges, shared goals, partner linking, shared streak, or shared dashboard. Weekly streak is individual. Body measurements and progress photos are private to the owner, so a partner cannot see weight. No nutrition tracking at all. | [10], [11], [12], [18], [19], [20] |

## Timed tasks (hands-on)

| Task | Taps | Seconds | Notes |
|---|---|---|---|
| Sign up to first usable screen | | | |
| Log meal (200 g chicken, 1 cup rice) | | | |
| Log workout (bench, squat, row 3x5) | | | |
| Log weight | | | |
| Connect second account | | | |
| See both people's progress today | | | |

Pending Phase 4 hands-on trial.

Note for the trial: Hevy has no meal logging, so task 2 will be "not supported". Task 5 is a follow request, and task 6 is the Profile Compare screen, which covers workouts only (no weight, no food).

## Review themes

Sample: about 40 App Store reviews visible on the US, Canada, UK and Australia listings (Apple's default "most helpful" ordering, dated 2022 to 2026, so it skews positive), plus roughly 50 r/Hevy post titles from 2025 to 2026, plus third party summaries (Marlvel, June 2026; Clarity; JustUseApp). Shares below are rough estimates from the App Store sample unless noted. Google Play reviews could not be retrieved.

| Theme | Praise or complaint | Approx. share | Example (paraphrased) |
|---|---|---|---|
| Fast, simple, intuitive logging | Praise | About 60% of sampled reviews; also the top praise theme in Marlvel's 65K review analysis | A UK reviewer says it is the best tracker they have found because it is simple but accurate. |
| Generous free tier, no ads, cheap Pro | Praise | About 20% | A Canadian reviewer likes that the free version works fully without pushy upgrade prompts. |
| Social accountability with friends and family | Praise | About 20% | An Australian reviewer calls it their gym buddy because all their friends use it and they keep each other accountable with photos and comments. |
| Apple Watch and Health integration | Praise | About 15% | A UK reviewer singles out Watch logging that works without the phone nearby. |
| Missing logging details (unilateral lifts, drop sets, notes, rest timer control, sub muscle groups) | Complaint / request | About 25% of reviews mention at least one; most common request type on r/Hevy | A reviewer wants left and right sides tracked separately for accurate stats. |
| Pro gating (routine cap, 3 month history) | Complaint | About 5% of sampled reviews, but Marlvel lists it as the top complaint theme | A Canadian reviewer says the free version caps how far back you can see progress. |
| Watch, heart rate and sync bugs | Complaint | About 3% of reviews; about 10 r/Hevy threads in the last month | An Australian reviewer reports Watch and phone sync problems that persisted after contacting support. |
| Trainer progression logic | Complaint | Reddit only, about 5 threads in Sept 2026 | A Redditor says Trainer suggested lighter weights even after hitting rep targets. |

Partner / couple mentions: in about 40 App Store reviews, 0 explicitly mention a spouse or romantic partner, 2 mention family members using it together, and about 5 mention friends. On r/Hevy, 2 posts in 2026 reference a wife: one where the ChatGPT plugin was connected to the wife's Hevy account instead of his own (a shared device or account confusion signal), and one sharing a routine his wife designed. The bigger related demand is for groups: at least 4 r/Hevy feature requests for groups or clubs (84, 44, 39 and 5 upvotes, May 2025 to June 2026) asking for private friend groups, gym groups, shared group goals and group leaderboards. No official Hevy reply was found on these. Separately, a post wishing Hevy had a nutrition version got about 105 upvotes (Aug 2026), and several threads ask which calorie app to pair with Hevy.

## Takeaways for FitPartner

- **Borrow:**
  - Hevy's logging speed bar: previous set values prefilled, rest timer, superset and drop set types. This is what users praise most, so FitPartner's workout logger must feel this fast.
  - Profile Compare layout (same time window, same exercises, side by side PRs, volume and muscle split). It is the closest thing to a two person view in the category and a good template for the shared dashboard's lifting panel.
  - Weekly streak with backdate recovery: one workout per calendar week keeps it alive, and logging a past workout restores it. Forgiving rules suit a shared streak.
  - Pricing anchor: USD 23.99 or CAD 31.99 per year is the category floor. Lifetime option is popular on Reddit.
  - Hand off AI to ChatGPT or Claude via export or plugin rather than building a coach in house first.
- **Beat:**
  - Hevy has no partner linking, no shared streak, no shared goals, and keeps weight private. FitPartner's real time two person dashboard with calories, protein, weight and a joint weekly streak is a gap Hevy does not cover.
  - No nutrition at all. Hevy users visibly ask for it and run a second app. One app for lifting plus food is a clear wedge.
  - No duo plan: Hevy tells couples to buy two subscriptions. A single couples price below two Hevy Pro plans is an easy message.
  - Groups and challenges are a top unmet social request; a two person "group" is the smallest version and FitPartner can own it.
- **Skip:**
  - A public follow graph, Discover feed and global style leaderboards. Hevy already does this well, and some reviewers dislike social pressure. FitPartner should stay private by default between two people.
  - Building a rules based program generator early. Hevy's Trainer draws steady progression bug reports and is not why people choose Hevy.
  - Native Watch app and wearable integrations in v1. They drive a large share of Hevy's bug threads.

## Sources

1. Hevy home page: https://www.hevyapp.com/ (positioning, 16M+ users claim, platforms, social, watch support)
2. Hevy on the US App Store: https://apps.apple.com/us/app/hevy-workout-tracker-gym-log/id1458862350 (USD IAP prices, v3.1.15 release notes, 4.9 rating from about 96K ratings, social features)
3. SensAI, Hevy review 2026 (checked 2026-09-15): https://www.sensai.fit/blog/hevy-review-2026 (free vs Pro limits; third party)
4. SensAI, fitness app pricing comparison (checked 2026-09-08): https://www.sensai.fit/blog/fitness-app-pricing-free-tier-comparison (free tier limits, no ads; third party)
5. Hevy on the Canada App Store: https://apps.apple.com/ca/app/hevy-gym-tracker-workout-log/id1458862350 (CAD IAP prices; reviews: https://apps.apple.com/ca/app/hevy-workout-tracker-gym-log/id1458862350?see-all=reviews)
6. Hevy help center, Pro sale 50% off first year: https://help.hevyapp.com/hc/en-us/articles/38223834432279-Hevy-Pro-Sale-50-Off-First-Year
7. Hevy help center, Hevy Trainer explained (algorithm, not AI; Pro only): https://help.hevyapp.com/hc/en-us/articles/38385724273047-Hevy-Trainer-Explained-How-It-Builds-Your-Workout-Program
8. Hevy blog, announcing Hevy Trainer (2026-02-18, included in Pro): https://www.hevyapp.com/announcing-hevy-trainer/
9. Hevy help center, body measurements and progress photos (bodyweight and waist free, rest Pro, private to owner): https://help.hevyapp.com/hc/en-us/articles/34462134138775-How-to-Record-Body-Measurements-and-Progress-Photos
10. Hevy help center, social guide: https://help.hevyapp.com/hc/en-us/articles/35688036014231-Hevy-App-Social-Guide-Connect-Follow-and-Share-Your-Workouts
11. Hevy help center, compare progress with friends: https://help.hevyapp.com/hc/en-us/articles/38223346135191-How-to-Compare-Your-Progress-With-Friends-on-Hevy
12. Hevy help center, weekly streak: https://help.hevyapp.com/hc/en-us/articles/34467766576279-How-to-Get-Your-Weekly-Streak-Back-in-the-Hevy-App
13. Hevy help center, Family Sharing (not supported; buy extra subscriptions on hevy.com): https://help.hevyapp.com/hc/en-us/articles/38385995539735-What-is-a-Family-Sharing-plan-and-is-Hevy-a-part-of-it
14. App Pricing Lab, US IAP list (checked 2026-04-15): https://apppricinglab.com/iap/apple/1458862350 ; Pulse Signal price history (prices stable since March 2026): https://getpulsesignal.com/changes/hevy ; RecurDash (verified 2026-07-21): https://recurdash.com/subscription-pricing/hevy
15. hevy-py README (API needs Pro; third party, unverified): https://github.com/ewright3/hevy-py ; official API docs: https://api.hevyapp.com/docs/
16. Hevy ChatGPT app page (free, @hevy tag, iOS, Android, desktop): https://www.hevyapp.com/features/hevy-gpt/
17. Example third party MCP server for Hevy: https://glama.ai/mcp/servers/karlhsueh/hevyapp-mcp
18. Hevy social features page (no groups, challenges or partner linking listed): https://www.hevyapp.com/features/social-features/
19. Hevy gym leaderboard page (38 lifts, followed users only): https://www.hevyapp.com/features/gym-leaderboard/
20. Hevy community update, July 2026 (Trainer upgrades, Strava strength sync, roadmap): https://www.hevyapp.com/community-updates/july-26/
21. Coachway, Hevy Coach pricing (August 2026; third party, unverified): https://coachway.io/articles/hevy-coach-pricing/
22. Hevy help center, Garmin integration not possible: https://help.hevyapp.com/hc/en-us/articles/35361029194647-Hevy-and-Garmin-Integration-Update-Why-It-s-Not-Possible-Yet
23. App Store review pages: US https://apps.apple.com/us/app/hevy-workout-tracker-gym-log/id1458862350?see-all=reviews ; UK https://apps.apple.com/gb/app/hevy-workout-tracker-gym-log/id1458862350?see-all=reviews ; AU https://apps.apple.com/au/app/hevy-workout-tracker-gym-log/id1458862350?see-all=reviews
24. Marlvel review analysis (65K reviews, report 2026-06-12; top praise and complaint; third party): https://marlvel.ai/intel-report/health-fitness/com-hevyapp-hevy
25. Clarity review insight (third party, undated): https://www.onclarity.com/leaderboard/insight/hevy ; JustUseApp reviews: https://justuseapp.com/en/app/1458862350/hevy-gym-trainingstagebuch/reviews
26. r/Hevy group requests (read via a Reddit mirror): https://www.reddit.com/r/Hevy/comments/1kih95q/feature_request_lets_bring_clubs_or_groups_to/ ; https://www.reddit.com/r/Hevy/comments/1n6i1ha/location_gym_groups/ ; https://www.reddit.com/r/Hevy/comments/1nj0kru/hevy_should_allow_ppl_to_createjoin_groups/ ; https://www.reddit.com/r/Hevy/comments/1ua6ypr/idea_groups_group_goals/
27. r/Hevy nutrition request (about 105 upvotes, 2026-08-12): https://www.reddit.com/r/Hevy/comments/1vmje7o/hevy_is_so_motivating_wish_there_was_a_version/
28. r/Hevy searches used for partner, bug and Pro themes (mirror): https://redlib.groet-infra.nl/r/Hevy/search?q=girlfriend+OR+wife+OR+partner+OR+couple+OR+husband&restrict_sr=on ; https://redlib.groet-infra.nl/r/Hevy/search?q=pro+OR+paywall+OR+subscription+OR+price&restrict_sr=on&t=year
29. GummySearch r/Hevy overview (about 39K members, weekly Find Friends thread; third party): https://gummysearch.com/r/Hevy/
30. App Pricing Lab, Google Play listing (4.9 from about 202K reviews, 5M installs, checked 2026-03-11; third party estimate): https://apppricinglab.com/app/google_play/com.hevy

Third party estimates: Google Play shows about 5M installs per App Pricing Lab [30]. Marlvel reports Hevy at #24 Free and #54 Grossing in US Health and Fitness as of June 2026 [24]. No revenue figures found. The 16M users figure is Hevy's own marketing claim [1].
