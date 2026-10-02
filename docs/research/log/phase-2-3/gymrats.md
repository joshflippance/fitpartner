# GymRats research log (Phases 2 and 3)

**Date:** 2026-10-02
**Agent:** desk research and review mining agent
**Clock time:** about 10 minutes of agent time (13:37 to 13:47 UTC, first file read to log write)
**Output:** `docs/research/apps/gymrats.md`

## Searches run

The session's WebSearch budget ran out after 4 searches, so most discovery used WebFetch on known URLs and help center collection pages.

1. help.gymrats.app scoring challenge admin guide
2. site:help.gymrats.app club challenge difference streak
3. help.gymrats.app Strava Garmin Fitbit sync device
4. GymRats Rat Pack Pro subscription
5. GymRats app Brasil sucesso desafio academia 2025
6. Blocked by budget: GymRats acquisition or funding; GymRats reviews mentioning husband, wife or boyfriend
7. Reddit mirror searches: "gymrats app"; gymrats with partner terms (English and Portuguese, posts and comments); "gymrats" app challenge friends

## Sources relied on most

- Official: gymrats.app home, features, pricing, about, news; help.gymrats.app collections (Admin Guide, Member Guide, Check-in Guide, Device syncing, Premium) and about 20 articles.
- Stores: App Store US (listing, reviews, version history), Canada (CAD prices, reviews), UK, Australia, Brazil (BRL prices, 148K ratings, chart rank, reviews); Google Play listing.
- Press: Maquina do Esporte (June 2025), Canaltech (Dec 2025), Correio 24horas (June 2025).
- Third party: JustUseApp review summary.
- Community: about 10 Reddit threads via a redlib mirror; permalinks converted to reddit.com URLs in the profile.

## Blocked or failed

- Apple RSS review feed: blocked by the proxy (curl 403) and robots.txt (WebFetch). No bulk or most recent review pull.
- iTunes lookup API: blocked by the proxy; US rating count taken from the store page and the Phase 1 log.
- gymrats.app/faq redirects to the help center; one collection URL without its numeric ID returned 404.
- TecMundo article blocked by robots.txt.
- First Google Play fetch with an hl parameter returned the JEFIT listing; a second fetch without it returned GymRats.
- WebSearch session budget exhausted (200 of 200), which limited press, funding and Android review searches.

## Could not confirm

- Whether the Train tab logs weight and reps per set in detail, and whether it is free or Pro. Release notes mention sets and routines only.
- Whether streaks are free or Pro, and how they are defined.
- Whether teams are free (pricing page lists team challenges as free; the teams article does not say).
- Minimum group size: no limit is documented, so a two person challenge is assumed possible but not tested.
- Fitbit and Garmin syncing are listed as free on the pricing page, while a 2023 to 2025 review summary says manual entry was needed; likely resolved in 2025, not confirmed.
- USD 2.99 and 14.99 prices on JustUseApp look outdated; not reconciled.
- 1M+ downloads and the 93% Brazil share are third party estimates from one outlet.
- Review theme shares are rough estimates from a small, non random sample (about 60 reviews); Josh should spot check 20 per the plan.
- Only 1 spouse mention found, and it comes from a third party summary page, not the store directly.
