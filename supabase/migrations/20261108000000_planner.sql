-- Workout planner (rules plus AI adjustments), cardio and stretching.
--
-- Josh's choices (2026-11-06 to 2026-11-08):
--   * Option C, built all at once: rules-based planner plus an optional AI layer.
--   * Program with override: each person sets a default program; any session can use another type or length.
--   * AI model: Claude Sonnet 5.5, opt-in per person.
--
-- Additive only: new columns, tables and starter rows. No existing rows or columns change.

-- ---------------------------------------------------------------------------
-- Exercise kinds
-- ---------------------------------------------------------------------------
-- strength: sets x reps x weight (existing behaviour)
-- cardio:   timed, steady or intervals
-- warmup:   timed dynamic mobility, done before lifting
-- stretch:  timed static stretch, done after lifting
alter table public.exercises
  add column kind text not null default 'strength'
    check (kind in ('strength', 'cardio', 'warmup', 'stretch'));

-- ---------------------------------------------------------------------------
-- Planned sessions and timed blocks
-- ---------------------------------------------------------------------------
-- The plan a session was started from (blocks, targets, source rules or ai). Null for routine and empty workouts.
alter table public.workout_logs add column plan jsonb;

-- Timed items completed in a session: warm-up, cardio and stretches.
create table public.workout_blocks (
  id            uuid primary key default gen_random_uuid(),
  workout_id    uuid not null references public.workout_logs (id) on delete cascade,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  household_id  uuid not null references public.households (id) on delete cascade,
  exercise_id   uuid not null references public.exercises (id),
  section       text not null check (section in ('warmup', 'cardio', 'stretch')),
  seconds       integer not null check (seconds between 1 and 14400),
  created_at    timestamptz not null default now(),
  unique (workout_id, section, exercise_id)  -- the same machine can appear in warm-up and as a finisher
);

create index workout_blocks_workout_idx   on public.workout_blocks (workout_id);
create index workout_blocks_user_idx      on public.workout_blocks (user_id);
create index workout_blocks_household_idx on public.workout_blocks (household_id);
create index workout_blocks_exercise_idx  on public.workout_blocks (exercise_id);

alter table public.workout_blocks enable row level security;

create policy "household reads" on public.workout_blocks for select to authenticated
  using (household_id = (select public.my_household_id()));
create policy "own inserts" on public.workout_blocks for insert to authenticated
  with check (user_id = (select auth.uid())
              and household_id = (select public.my_household_id())
              and public.owns_open_workout(workout_id));
create policy "own updates" on public.workout_blocks for update to authenticated
  using (user_id = (select auth.uid()) and public.owns_open_workout(workout_id))
  with check (user_id = (select auth.uid()) and public.owns_open_workout(workout_id));
create policy "own removes" on public.workout_blocks for delete to authenticated
  using (user_id = (select auth.uid()) and public.owns_open_workout(workout_id));

alter publication supabase_realtime add table public.workout_blocks;

-- ---------------------------------------------------------------------------
-- Training programs (one per person)
-- ---------------------------------------------------------------------------
create table public.training_programs (
  user_id         uuid primary key references public.profiles (id) on delete cascade,
  household_id    uuid not null references public.households (id) on delete cascade,
  split           text not null default 'full_body'
                    check (split in ('full_body', 'upper_lower', 'ppl', 'ppl_ul', 'circuit')),
  days_per_week   integer not null default 3 check (days_per_week between 1 and 7),
  minutes         integer not null default 45 check (minutes in (30, 45, 60, 75)),
  cardio_minutes  integer not null default 0 check (cardio_minutes in (0, 10, 15, 20)),
  warmup          boolean not null default true,
  stretch         boolean not null default true,
  ai_enabled      boolean not null default false,  -- opt-in: nothing of this person goes to the AI until true
  updated_at      timestamptz not null default now()
);

create index training_programs_household_idx on public.training_programs (household_id);

create trigger training_programs_touch before update on public.training_programs
  for each row execute function public.touch_updated_at();

alter table public.training_programs enable row level security;

-- Partners can read each other's program (joint sessions need both); each person writes only their own.
create policy "household reads" on public.training_programs for select to authenticated
  using (household_id = (select public.my_household_id()));
create policy "own inserts" on public.training_programs for insert to authenticated
  with check (user_id = (select auth.uid()) and household_id = (select public.my_household_id()));
create policy "own updates" on public.training_programs for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and household_id = (select public.my_household_id()));

alter publication supabase_realtime add table public.training_programs;

-- ---------------------------------------------------------------------------
-- Starter cardio, warm-up and stretches
-- ---------------------------------------------------------------------------
insert into public.exercises (household_id, name, muscle_group, equipment, kind) values
  -- cardio
  (null, 'Treadmill',              'full_body',  '{treadmill}',  'cardio'),
  (null, 'Stationary Bike',        'full_body',  '{bike}',       'cardio'),
  (null, 'Rowing Machine',         'full_body',  '{rower}',      'cardio'),
  (null, 'Elliptical',             'full_body',  '{elliptical}', 'cardio'),
  (null, 'Jump Rope',              'full_body',  '{jump_rope}',  'cardio'),
  (null, 'Brisk Walk or Jog',      'full_body',  '{}',           'cardio'),
  (null, 'Jumping Jacks',          'full_body',  '{}',           'cardio'),
  -- warm-up (dynamic)
  (null, 'Arm Circles',            'shoulders',  '{}',           'warmup'),
  (null, 'Band Pull-Apart',        'shoulders',  '{bands}',      'warmup'),
  (null, 'Leg Swings',             'hamstrings', '{}',           'warmup'),
  (null, 'Hip Circles',            'glutes',     '{}',           'warmup'),
  (null, 'Cat-Cow',                'back',       '{}',           'warmup'),
  (null, 'World''s Greatest Stretch', 'full_body', '{}',         'warmup'),
  (null, 'Bodyweight Squat',       'quads',      '{}',           'warmup'),
  (null, 'Inchworm',               'full_body',  '{}',           'warmup'),
  -- stretch (static)
  (null, 'Chest Doorway Stretch',  'chest',      '{}',           'stretch'),
  (null, 'Cross-body Shoulder Stretch', 'shoulders', '{}',       'stretch'),
  (null, 'Overhead Triceps Stretch', 'triceps',  '{}',           'stretch'),
  (null, 'Lat Stretch',            'back',       '{}',           'stretch'),
  (null, 'Child''s Pose',          'back',       '{}',           'stretch'),
  (null, 'Standing Quad Stretch',  'quads',      '{}',           'stretch'),
  (null, 'Seated Hamstring Stretch', 'hamstrings', '{}',         'stretch'),
  (null, 'Kneeling Hip Flexor Stretch', 'quads', '{}',           'stretch'),
  (null, 'Figure-4 Glute Stretch', 'glutes',     '{}',           'stretch'),
  (null, 'Wall Calf Stretch',      'calves',     '{}',           'stretch'),
  (null, 'Biceps Wall Stretch',    'biceps',     '{}',           'stretch'),
  (null, 'Cobra Stretch',          'core',       '{}',           'stretch');
