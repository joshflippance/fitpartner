-- FP-15 lifting: exercises, equipment locations, routines and per-set logging.
--
-- Ownership model (Josh's choices, 2026-10-19):
--   * Exercises: shared starter library (household_id null) plus household custom exercises.
--   * Routines: visible to the whole household; only the owner edits; anyone can copy.
--   * Locations: shared by the household, each with an equipment list.
--   * Progression: rep ranges (double progression), computed in the app.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.locations (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households (id) on delete cascade,
  name          text not null check (length(trim(name)) between 1 and 40),
  equipment     text[] not null default '{}',
  created_by    uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  unique (household_id, name)
);

create table public.exercises (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid references public.households (id) on delete cascade, -- null = starter library
  name          text not null check (length(trim(name)) between 1 and 60),
  muscle_group  text not null check (muscle_group in
                  ('chest','back','shoulders','biceps','triceps','quads','hamstrings','glutes','calves','core','full_body')),
  equipment     text[] not null default '{}', -- every item is required; empty means bodyweight
  created_by    uuid references public.profiles (id) on delete set null,
  archived      boolean not null default false,
  created_at    timestamptz not null default now()
);

create unique index exercises_library_name_idx on public.exercises (lower(name)) where household_id is null;
create unique index exercises_household_name_idx on public.exercises (household_id, lower(name)) where household_id is not null;

create table public.routines (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households (id) on delete cascade,
  owner_id      uuid not null references public.profiles (id) on delete cascade,
  name          text not null check (length(trim(name)) between 1 and 60),
  notes         text,
  copied_from   uuid references public.routines (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.routine_exercises (
  id            uuid primary key default gen_random_uuid(),
  routine_id    uuid not null references public.routines (id) on delete cascade,
  exercise_id   uuid not null references public.exercises (id),
  position      integer not null default 0,
  target_sets   integer not null default 3 check (target_sets between 1 and 10),
  rep_min       integer not null default 8 check (rep_min between 1 and 50),
  rep_max       integer not null default 12 check (rep_max between 1 and 50),
  rest_seconds  integer not null default 90 check (rest_seconds between 0 and 600),
  check (rep_max >= rep_min)
);

alter table public.workout_logs
  add column routine_id  uuid references public.routines (id) on delete set null,
  add column location_id uuid references public.locations (id) on delete set null,
  add column started_at  timestamptz,
  add column finished_at timestamptz;

create table public.workout_sets (
  id            uuid primary key default gen_random_uuid(),
  workout_id    uuid not null references public.workout_logs (id) on delete cascade,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  household_id  uuid not null references public.households (id) on delete cascade,
  exercise_id   uuid not null references public.exercises (id),
  set_number    integer not null check (set_number between 1 and 20),
  reps          integer not null check (reps between 0 and 100),
  weight_kg     numeric(6,2) not null default 0 check (weight_kg >= 0 and weight_kg < 1000),
  created_at    timestamptz not null default now()
);

-- Covering indexes for foreign keys and the common lookups.
create index locations_household_idx          on public.locations (household_id);
create index exercises_household_idx          on public.exercises (household_id);
create index routines_household_idx           on public.routines (household_id);
create index routines_owner_idx               on public.routines (owner_id);
create index routine_exercises_routine_idx    on public.routine_exercises (routine_id, position);
create index routine_exercises_exercise_idx   on public.routine_exercises (exercise_id);
create index workout_logs_routine_idx         on public.workout_logs (routine_id);
create index workout_logs_location_idx        on public.workout_logs (location_id);
create index workout_sets_workout_idx         on public.workout_sets (workout_id);
create index workout_sets_user_exercise_idx   on public.workout_sets (user_id, exercise_id, created_at desc);
create index workout_sets_household_idx       on public.workout_sets (household_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- True when the caller owns the workout and it is still inside the editing window.
create or replace function public.owns_open_workout(workout uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workout_logs w
    where w.id = workout and w.user_id = auth.uid() and w.log_date >= current_date - 15
  );
$$;

-- Copy any household routine into a new one owned by the caller.
create or replace function public.copy_routine(source uuid, new_name text default null)
returns public.routines
language plpgsql
security definer
set search_path = public
as $$
declare
  src public.routines;
  r public.routines;
begin
  select * into src from public.routines where id = source;
  if src.id is null or src.household_id is distinct from public.my_household_id() then
    raise exception 'Routine not found';
  end if;

  insert into public.routines (household_id, owner_id, name, notes, copied_from)
  values (src.household_id, auth.uid(),
          left(coalesce(nullif(trim(new_name), ''), src.name || ' (my copy)'), 60),
          src.notes, src.id)
  returning * into r;

  insert into public.routine_exercises (routine_id, exercise_id, position, target_sets, rep_min, rep_max, rest_seconds)
  select r.id, exercise_id, position, target_sets, rep_min, rep_max, rest_seconds
  from public.routine_exercises where routine_id = src.id;

  return r;
end;
$$;

-- Replace a routine's exercise list in one transaction. Runs as the caller, so RLS still applies
-- (only the routine's owner can write).
create or replace function public.save_routine_exercises(routine uuid, items jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (select 1 from public.routines r where r.id = routine and r.owner_id = auth.uid()) then
    raise exception 'Routine not found';
  end if;
  delete from public.routine_exercises where routine_id = routine;
  insert into public.routine_exercises (routine_id, exercise_id, position, target_sets, rep_min, rep_max, rest_seconds)
  select routine,
         (x ->> 'exercise_id')::uuid,
         (ordinality - 1)::int,
         coalesce((x ->> 'target_sets')::int, 3),
         coalesce((x ->> 'rep_min')::int, 8),
         coalesce((x ->> 'rep_max')::int, 12),
         coalesce((x ->> 'rest_seconds')::int, 90)
  from jsonb_array_elements(coalesce(items, '[]'::jsonb)) with ordinality as t(x, ordinality);
end;
$$;

revoke execute on function public.owns_open_workout(uuid), public.copy_routine(uuid, text),
  public.save_routine_exercises(uuid, jsonb) from public, anon;
grant execute on function public.owns_open_workout(uuid), public.copy_routine(uuid, text),
  public.save_routine_exercises(uuid, jsonb) to authenticated;

-- Keep routines.updated_at current.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function public.touch_updated_at() from public, anon, authenticated;

create trigger routines_touch before update on public.routines
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.locations         enable row level security;
alter table public.exercises         enable row level security;
alter table public.routines          enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.workout_sets      enable row level security;

-- Locations: shared and editable by either partner.
create policy "household reads" on public.locations for select to authenticated
  using (household_id = (select public.my_household_id()));
create policy "household writes" on public.locations for insert to authenticated
  with check (household_id = (select public.my_household_id()) and created_by = (select auth.uid()));
create policy "household updates" on public.locations for update to authenticated
  using (household_id = (select public.my_household_id()))
  with check (household_id = (select public.my_household_id()));
create policy "household deletes" on public.locations for delete to authenticated
  using (household_id = (select public.my_household_id()));

-- Exercises: starter library readable by all; custom ones by the household; creator edits; archive instead of delete.
create policy "library and household read" on public.exercises for select to authenticated
  using (household_id is null or household_id = (select public.my_household_id()));
create policy "create custom" on public.exercises for insert to authenticated
  with check (household_id = (select public.my_household_id()) and created_by = (select auth.uid()));
create policy "creator edits" on public.exercises for update to authenticated
  using (household_id = (select public.my_household_id()) and created_by = (select auth.uid()))
  with check (household_id = (select public.my_household_id()) and created_by = (select auth.uid()));

-- Routines: household reads, owner writes.
create policy "household reads" on public.routines for select to authenticated
  using (household_id = (select public.my_household_id()));
create policy "owner creates" on public.routines for insert to authenticated
  with check (household_id = (select public.my_household_id()) and owner_id = (select auth.uid()));
create policy "owner updates" on public.routines for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()) and household_id = (select public.my_household_id()));
create policy "owner deletes" on public.routines for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "household reads" on public.routine_exercises for select to authenticated
  using (exists (select 1 from public.routines r
                 where r.id = routine_id and r.household_id = (select public.my_household_id())));
create policy "owner writes" on public.routine_exercises for insert to authenticated
  with check (exists (select 1 from public.routines r
                      where r.id = routine_id and r.owner_id = (select auth.uid())));
create policy "owner updates" on public.routine_exercises for update to authenticated
  using (exists (select 1 from public.routines r where r.id = routine_id and r.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.routines r where r.id = routine_id and r.owner_id = (select auth.uid())));
create policy "owner deletes" on public.routine_exercises for delete to authenticated
  using (exists (select 1 from public.routines r where r.id = routine_id and r.owner_id = (select auth.uid())));

-- Sets: partners read each other's (workouts are always shared); owners write inside the editing window.
create policy "household reads" on public.workout_sets for select to authenticated
  using (household_id = (select public.my_household_id()));
create policy "own inserts" on public.workout_sets for insert to authenticated
  with check (user_id = (select auth.uid())
              and household_id = (select public.my_household_id())
              and public.owns_open_workout(workout_id));
create policy "own updates" on public.workout_sets for update to authenticated
  using (user_id = (select auth.uid()) and public.owns_open_workout(workout_id))
  with check (user_id = (select auth.uid()) and public.owns_open_workout(workout_id));
create policy "own deletes" on public.workout_sets for delete to authenticated
  using (user_id = (select auth.uid()) and public.owns_open_workout(workout_id));

alter publication supabase_realtime add table public.workout_sets;

-- ---------------------------------------------------------------------------
-- Starter exercise library
-- ---------------------------------------------------------------------------

insert into public.exercises (household_id, name, muscle_group, equipment) values
  (null, 'Barbell Bench Press',        'chest',      '{barbell,bench}'),
  (null, 'Incline Dumbbell Press',     'chest',      '{dumbbells,bench}'),
  (null, 'Dumbbell Bench Press',       'chest',      '{dumbbells,bench}'),
  (null, 'Push-up',                    'chest',      '{}'),
  (null, 'Cable Fly',                  'chest',      '{cable}'),
  (null, 'Chest Press Machine',        'chest',      '{machine}'),
  (null, 'Pull-up',                    'back',       '{pull_up_bar}'),
  (null, 'Lat Pulldown',               'back',       '{cable}'),
  (null, 'Barbell Row',                'back',       '{barbell}'),
  (null, 'One-arm Dumbbell Row',       'back',       '{dumbbells,bench}'),
  (null, 'Seated Cable Row',           'back',       '{cable}'),
  (null, 'Deadlift',                   'back',       '{barbell}'),
  (null, 'Overhead Press',             'shoulders',  '{barbell}'),
  (null, 'Dumbbell Shoulder Press',    'shoulders',  '{dumbbells}'),
  (null, 'Lateral Raise',              'shoulders',  '{dumbbells}'),
  (null, 'Face Pull',                  'shoulders',  '{cable}'),
  (null, 'Barbell Curl',               'biceps',     '{barbell}'),
  (null, 'Dumbbell Curl',              'biceps',     '{dumbbells}'),
  (null, 'Hammer Curl',                'biceps',     '{dumbbells}'),
  (null, 'Cable Curl',                 'biceps',     '{cable}'),
  (null, 'Triceps Pushdown',           'triceps',    '{cable}'),
  (null, 'Overhead Triceps Extension', 'triceps',    '{dumbbells}'),
  (null, 'Dip',                        'triceps',    '{}'),
  (null, 'Close-grip Bench Press',     'triceps',    '{barbell,bench}'),
  (null, 'Back Squat',                 'quads',      '{barbell,squat_rack}'),
  (null, 'Goblet Squat',               'quads',      '{dumbbells}'),
  (null, 'Leg Press',                  'quads',      '{machine}'),
  (null, 'Bulgarian Split Squat',      'quads',      '{dumbbells,bench}'),
  (null, 'Leg Extension',              'quads',      '{machine}'),
  (null, 'Walking Lunge',              'quads',      '{dumbbells}'),
  (null, 'Romanian Deadlift',          'hamstrings', '{barbell}'),
  (null, 'Dumbbell Romanian Deadlift', 'hamstrings', '{dumbbells}'),
  (null, 'Leg Curl',                   'hamstrings', '{machine}'),
  (null, 'Hip Thrust',                 'glutes',     '{barbell,bench}'),
  (null, 'Glute Bridge',               'glutes',     '{}'),
  (null, 'Cable Kickback',             'glutes',     '{cable}'),
  (null, 'Standing Calf Raise',        'calves',     '{}'),
  (null, 'Seated Calf Raise',          'calves',     '{machine}'),
  (null, 'Plank',                      'core',       '{}'),
  (null, 'Hanging Leg Raise',          'core',       '{pull_up_bar}'),
  (null, 'Cable Crunch',               'core',       '{cable}'),
  (null, 'Kettlebell Swing',           'full_body',  '{kettlebell}');
