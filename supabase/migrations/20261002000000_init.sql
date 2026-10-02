-- FitPartner initial schema
-- Profiles, households (2-person pairing), and daily logs (weight, meals, workouts).
-- Every log row carries household_id so RLS and Realtime filters stay cheap.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default 'Our household',
  pair_code   text not null unique,
  created_by  uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  display_name    text not null default 'Me',
  household_id    uuid references public.households (id) on delete set null,
  calorie_target  integer not null default 2200 check (calorie_target between 800 and 8000),
  protein_target  integer not null default 150  check (protein_target between 0 and 500),
  weight_unit     text not null default 'lb' check (weight_unit in ('lb', 'kg')),
  created_at      timestamptz not null default now()
);

create index profiles_household_idx on public.profiles (household_id);

create table public.weight_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  household_id  uuid not null references public.households (id) on delete cascade,
  log_date      date not null,
  weight_kg     numeric(5,2) not null check (weight_kg > 0 and weight_kg < 400),
  created_at    timestamptz not null default now(),
  unique (user_id, log_date)
);

create table public.meal_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  household_id  uuid not null references public.households (id) on delete cascade,
  log_date      date not null,
  name          text not null default 'Meal',
  calories      integer not null check (calories >= 0 and calories < 10000),
  protein_g     numeric(6,1) not null default 0 check (protein_g >= 0 and protein_g < 1000),
  created_at    timestamptz not null default now()
);

create table public.workout_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  household_id  uuid not null references public.households (id) on delete cascade,
  log_date      date not null,
  name          text not null default 'Lift',
  duration_min  integer check (duration_min is null or duration_min between 1 and 600),
  notes         text,
  created_at    timestamptz not null default now()
);

create index weight_logs_household_date_idx  on public.weight_logs  (household_id, log_date desc);
create index meal_logs_household_date_idx    on public.meal_logs    (household_id, log_date desc);
create index workout_logs_household_date_idx on public.workout_logs (household_id, log_date desc);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Caller's household. SECURITY DEFINER avoids RLS recursion on profiles.
create or replace function public.my_household_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select household_id from public.profiles where id = auth.uid();
$$;

-- Auto-create a profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Unambiguous 6-char code (no 0/O/1/I).
create or replace function public.generate_pair_code()
returns text
language plpgsql
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.households where pair_code = code);
  end loop;
  return code;
end;
$$;

-- ---------------------------------------------------------------------------
-- Pairing RPCs
-- ---------------------------------------------------------------------------

create or replace function public.create_household(household_name text default 'Our household')
returns public.households
language plpgsql
security definer
set search_path = public
as $$
declare
  h public.households;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  if (select household_id from public.profiles where id = auth.uid()) is not null then
    raise exception 'You are already in a household';
  end if;

  insert into public.households (name, pair_code, created_by)
  values (coalesce(nullif(trim(household_name), ''), 'Our household'), public.generate_pair_code(), auth.uid())
  returning * into h;

  update public.profiles set household_id = h.id where id = auth.uid();
  return h;
end;
$$;

create or replace function public.join_household(code text)
returns public.households
language plpgsql
security definer
set search_path = public
as $$
declare
  h public.households;
  member_count int;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  if (select household_id from public.profiles where id = auth.uid()) is not null then
    raise exception 'You are already in a household';
  end if;

  select * into h from public.households where pair_code = upper(trim(code)) for update;
  if h.id is null then
    raise exception 'No household found for that code';
  end if;

  select count(*) into member_count from public.profiles where household_id = h.id;
  if member_count >= 2 then
    raise exception 'That household is already full';
  end if;

  update public.profiles set household_id = h.id where id = auth.uid();
  return h;
end;
$$;

create or replace function public.leave_household()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  hid uuid;
begin
  select household_id into hid from public.profiles where id = auth.uid();
  if hid is null then
    return;
  end if;
  update public.profiles set household_id = null where id = auth.uid();
  -- Drop the household (and its logs) once nobody is left in it.
  if not exists (select 1 from public.profiles where household_id = hid) then
    delete from public.households where id = hid;
  end if;
end;
$$;

revoke execute on function public.generate_pair_code() from public, anon, authenticated;
grant execute on function public.create_household(text), public.join_household(text), public.leave_household(), public.my_household_id()
  to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.households   enable row level security;
alter table public.profiles     enable row level security;
alter table public.weight_logs  enable row level security;
alter table public.meal_logs    enable row level security;
alter table public.workout_logs enable row level security;

create policy "members read own household"
  on public.households for select to authenticated
  using (id = public.my_household_id());

create policy "read self and partner"
  on public.profiles for select to authenticated
  using (id = auth.uid() or household_id = public.my_household_id());

-- household_id is only changed via the RPCs above.
create policy "update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and household_id is not distinct from public.my_household_id());

do $$
declare
  t text;
begin
  foreach t in array array['weight_logs', 'meal_logs', 'workout_logs'] loop
    execute format(
      'create policy "household reads" on public.%I for select to authenticated
         using (household_id = public.my_household_id())', t);
    execute format(
      'create policy "own inserts" on public.%I for insert to authenticated
         with check (user_id = auth.uid() and household_id = public.my_household_id())', t);
    execute format(
      'create policy "own updates" on public.%I for update to authenticated
         using (user_id = auth.uid())
         with check (user_id = auth.uid() and household_id = public.my_household_id())', t);
    execute format(
      'create policy "own deletes" on public.%I for delete to authenticated
         using (user_id = auth.uid())', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.profiles, public.weight_logs, public.meal_logs, public.workout_logs;
