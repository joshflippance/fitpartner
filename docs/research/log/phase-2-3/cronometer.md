# Research log: Cronometer (Phases 2 and 3)

**Date:** 2026-10-02
**Agent:** desk research and review mining subagent
**Output:** `docs/research/apps/cronometer.md`
**Time taken:** about 15 minutes of clock time (13:20 to 13:35 UTC), including writing.

## Searches run (WebSearch)

1. Cronometer Gold price 2026 (returned only gold bullion results, discarded)
2. Cronometer new features 2026 AI photo logging
3. Cronometer "Crono Coach" AI
4. Cronometer share diary with partner spouse friend feature
5. reddit cronometer review 2026 ads free version complaints
6. Cronometer photo logging free users limit Gold support article
7. Cronometer Google Play com.cronometer.android
8. "Cronometer" Google Play rating reviews downloads 2026
9. reddit cronometer partner wife husband share meals tracking together
10. Cronometer Trustpilot reviews
11. site:reddit.com cronometer gold worth it (returned no Reddit pages)
12. Cronometer free vs Gold features support basic account
13. Cronometer Gold free trial 7 days Canada price CAD
14. Cronometer log exercise sets reps strength training
15. Cronometer photo logging free users voice logging basic
16. Cronometer Android app Google Play stars reviews downloads
17. cronometer streak feature logging streak
18. r/cronometer couple partner both accounts share food diary
19. Cronometer Gold free trial length

## Sources relied on most

- Official: cronometer.com home, /gold, updates changelog blog, Crono Coach blog, AI approach blog, photo logging blog, 4 ways to log blog, streaks blog, support articles (Basic account, Mobile Photo Logging).
- Stores: Apple App Store CA and US listings. AppBrain for Google Play stats.
- Community: 8 Cronometer forum threads (partner sharing, ads, sets and reps).
- Third party: MyNetDiary scorecard Feb 2026, Trustpilot, Fortune review, Nutrola blogs (competitor, used only where marked).

## Could not confirm

- **Google Play listing direct:** WebFetch of play.google.com repeatedly returned unrelated apps (a home workout app, a blood sugar app, JEFIT). Curl returned nothing parseable. Android stats come from AppBrain only (third-party estimate).
- **Free trial:** no official source states a Gold free trial or its length.
- **Pricing conflict:** official Gold page shows USD 10.99/month and USD 59.99/year. Nutrola says USD 49.99/year annual only, GarageGymReviews says USD 8.99/month or 49.99/year. Treated official page and CA App Store (CAD 14.99 and 79.99) as current; third-party figures look stale.
- **Nutrola claim that voice logging does not exist** contradicts official changelog (Voice Log, April 2026). Official source used.
- **Cronometer Pro price** (USD 24.95/month) from one third-party source only.
- **Sets and reps exercise logging:** only a 2019 forum request found. Current behavior must be checked in the Phase 4 trial.
- **Reddit directly:** no Reddit threads were reachable through search. Reddit sentiment is from a competitor blog summary and is marked unverified.
- **App Store rating counts vary by fetch:** CA listing 4.7 from about 12K ratings; US listing fetches returned 4.8 from 98K and 4.8 from 58.1K (the latter looks cached, older version 4.21.7). App Pricing Lab shows 4.8 from 88.2K. Not used as a headline figure.
- **Review theme shares** are rough estimates from about 100 reviews and posts, not a counted dataset.

## AI accuracy notes for the case study

- WebFetch of Google Play returned confidently wrong app data three times. Caught by checking the app name and developer in the output.
- Competitor blogs (Nutrola) gave outdated or wrong feature claims. Caught by cross-checking against the official changelog.
