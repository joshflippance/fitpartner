# Deploying FitPartner (FP-01)

You do the account steps (they need your sign-ins and keys). Everything else is already in the repo. Steps take about 20 minutes.

## 1. Supabase project

1. Create a new project at supabase.com. Pick the region closest to you (Canada Central for Burlington).
2. Save the database password somewhere safe.
3. **Run the migrations in order** in SQL Editor, one at a time:
   1. `supabase/migrations/20261002000000_init.sql`
   2. `supabase/migrations/20261002010000_weekly_streak.sql`
   3. `supabase/migrations/20261002020000_log_date_window.sql`

   Or with the CLI: `supabase link --project-ref <ref>` then `supabase db push`.
4. **Copy two values** from Project Settings > API: the project URL and the publishable key. Never use the secret key in this app.

## 2. Vercel

1. At vercel.com, Add New > Project > import `joshflippance/fitpartner`.
2. Framework is detected as Next.js. Leave build settings as they are.
3. Add environment variables (Production and Preview):
   - `NEXT_PUBLIC_SUPABASE_URL` = project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key
4. Deploy. Note the production URL (for example `fitpartner.vercel.app`).

## 3. Supabase auth settings

In Authentication > URL Configuration:
- **Site URL:** your production URL.
- **Redirect URLs:** add `https://<your-domain>/**` and `http://localhost:3000/**`.

In Authentication > Providers > Email:
- **Confirm email:** your call. Off is fastest for you and April; turn it on before other couples join.
- **Minimum password length:** 8 (the app already requires 8).

Supabase's built-in email sender is rate limited and meant for testing. Set up custom SMTP (Authentication > Emails) before the beta so reset and confirmation emails arrive reliably.

## 4. Smoke test (both phones)

1. Open the production URL, create Josh's account, create a household, note the code.
2. On April's phone, create her account and join with the code.
3. Log a meal on one phone and confirm the other updates within a couple of seconds.
4. Log a workout for yesterday (Log > date arrow) and confirm the streak card counts it.
5. Use "Forgot password?" and confirm the reset email link opens the set-password page.
6. Install to home screen: iPhone Safari Share > Add to Home Screen; Android Chrome menu > Install app.

## 5. Done when

- Both partners signed in on the installed app
- Realtime sync confirmed in both directions
- Password reset email works on the production domain
