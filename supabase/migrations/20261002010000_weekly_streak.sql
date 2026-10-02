-- Weekly workout target per person. Drives the shared weekly streak:
-- a week counts when every household member trains on at least this many distinct days.
alter table public.profiles
  add column weekly_workout_target integer not null default 3
  check (weekly_workout_target between 1 and 7);
