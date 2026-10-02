# Sweatmates research log (Phases 2 and 3)

**Date:** 2026-10-02
**Agent:** desk research and review mining agent
**Clock time:** about 6 minutes of agent time (13:37 to 13:43 UTC, first file read to log write)
**Output:** `docs/research/apps/sweatmates.md`

## Searches run

1. Sweatmates partner fitness app
2. Sweatmates app couples workout wager streak SweatCam
3. "Sweatmates" app reddit couples
4. "KnightCollar" app founder
5. Sweatmates couples fitness app tiktok OR instagram OR "product hunt" 2026
6. A sixth search (Lock In Mode, Pinky Promise) was refused: the session's web search budget was used up. Remaining work used WebFetch only.

None of the searches returned Reddit threads, press, Product Hunt, or founder posts about this app. Results were mostly unrelated apps with similar names (Sweat, SweatPals, Sweatt, SwoleMates).

## Sources relied on most

- Official: US App Store listing, description, IAP list, privacy labels and full version history; Canada App Store listing (CAD prices); iTunes lookup API (version, dates, rating count); KnightCollar developer page; sweatmates.app (rendered only meta text).
- Reviews: App Store review pages for US (10), Canada (6), UK (2), Australia (3).
- Third party: MWM (download estimate, Google Play claim), Bitrise App Navigator (release frequency).

## Blocked or failed

- curl to itunes.apple.com blocked by the proxy (403); WebFetch to the lookup API worked.
- Apple RSS review feed blocked by robots.txt, so no bulk review pull.
- sweatmates.app, /terms and /privacy render client side; only meta tags came back, so terms, wager rules, trial length and partner visibility rules could not be read.
- Google Play search, Product Hunt, TikTok and Instagram blocked by robots.txt.
- sweatmates.com redirects to the App Store listing.

## Could not confirm

- Which IAP SKU maps to which billing period, trial length, and whether one subscription covers both partners.
- About USD 40 per year as the main offer, the lack of a monthly option, and the 50% exit discount: from single reviews only.
- Dual camera (front and back) SweatCam and comments on check-ins: from reviews only.
- Android availability: MWM claims a Google Play listing; Phase 1 found none. Not checked directly.
- Lock In Mode release date: notes for v1.1.9 (Feb 2026) and v1.4.3 (Sep 2026) both describe it; the earlier entry may be an Apple page artifact.
- How a week resolves when one partner hits their goal and the other misses (does only the missing partner owe the wager?), and what happens to the streak. Listing implies each person owes if they miss their own goal; needs the Phase 4 trial.
- Download estimate (100K+) is a third party estimate. Review theme shares come from 21 reviews in Apple's default ordering and are far more negative than the 4.9 star average; Josh should spot check per the plan.
- Founder identity and launch story: nothing found.
