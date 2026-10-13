-- FP-09 nudges and Pinky Promise, FP-10 per-metric privacy.

-- ---------------------------------------------------------------------------
-- FP-10: per-metric privacy
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column share_weight boolean not null default true,
  add column share_meals  boolean not null default true;

-- True when the caller may read `owner`'s rows of the given kind.
-- Owners always see their own data; partners only when the owner shares it.
create or replace function public.can_see(owner uuid, what text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select owner = auth.uid() or exists (
    select 1
    from public.profiles p
    where p.id = owner
      and p.household_id is not null
      and p.household_id = (select household_id from public.profiles where id = auth.uid())
      and case what
            when 'weight' then p.share_weight
            when 'meals'  then p.share_meals
            else false
          end
  );
$$;

grant execute on function public.can_see(uuid, text) to authenticated;

drop policy "household reads" on public.weight_logs;
create policy "household reads" on public.weight_logs for select to authenticated
  using (household_id = public.my_household_id() and public.can_see(user_id, 'weight'));

drop policy "household reads" on public.meal_logs;
create policy "household reads" on public.meal_logs for select to authenticated
  using (household_id = public.my_household_id() and public.can_see(user_id, 'meals'));

-- ---------------------------------------------------------------------------
-- FP-09: Pinky Promise (late workouts need the partner's OK)
-- ---------------------------------------------------------------------------

-- A workout dated more than this many days before it is logged needs approval.
create or replace function public.late_log_days()
returns integer
language sql
immutable
as $$ select 2 $$;

alter table public.workout_logs
  add column status text not null default 'counted'
    check (status in ('counted', 'pending', 'declined')),
  add column reviewed_by uuid references public.profiles (id) on delete set null,
  add column reviewed_at timestamptz;

-- Owners can't set their own status. It is derived on insert and on date changes,
-- and only review_workout() can change it otherwise.
create or replace function public.workout_status_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  members int;
begin
  if coalesce(current_setting('fitpartner.reviewing', true), '') = 'on' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    new.status := old.status;
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;
    if new.log_date = old.log_date then
      return new;
    end if;
  end if;

  select count(*) into members from public.profiles where household_id = new.household_id;

  if members >= 2 and new.log_date < current_date - public.late_log_days() then
    new.status := 'pending';
  else
    new.status := 'counted';
  end if;
  new.reviewed_by := null;
  new.reviewed_at := null;
  return new;
end;
$$;

create trigger workout_status_guard
  before insert or update on public.workout_logs
  for each row execute function public.workout_status_guard();

create or replace function public.review_workout(workout_id uuid, approve boolean)
returns public.workout_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.workout_logs;
begin
  select * into w from public.workout_logs where id = workout_id for update;
  if w.id is null or w.household_id is distinct from public.my_household_id() then
    raise exception 'Workout not found';
  end if;
  if w.user_id = auth.uid() then
    raise exception 'Your partner has to review this one';
  end if;
  if w.status <> 'pending' then
    raise exception 'Already reviewed';
  end if;

  perform set_config('fitpartner.reviewing', 'on', true);
  update public.workout_logs
     set status = case when approve then 'counted' else 'declined' end,
         reviewed_by = auth.uid(),
         reviewed_at = now()
   where id = workout_id
  returning * into w;
  perform set_config('fitpartner.reviewing', 'off', true);

  return w;
end;
$$;

grant execute on function public.review_workout(uuid, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- FP-09: nudges
-- ---------------------------------------------------------------------------

create table public.nudges (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households (id) on delete cascade,
  from_user     uuid not null references public.profiles (id) on delete cascade,
  to_user       uuid not null references public.profiles (id) on delete cascade,
  created_at    timestamptz not null default now(),
  seen_at       timestamptz
);

create index nudges_to_user_idx on public.nudges (to_user, created_at desc);

alter table public.nudges enable row level security;

create policy "sender and recipient read" on public.nudges for select to authenticated
  using (household_id = public.my_household_id() and auth.uid() in (from_user, to_user));

-- Recipients can only mark a nudge seen.
create policy "recipient marks seen" on public.nudges for update to authenticated
  using (to_user = auth.uid())
  with check (to_user = auth.uid());

revoke insert, update, delete on public.nudges from authenticated, anon;
grant select on public.nudges to authenticated;
grant update (seen_at) on public.nudges to authenticated;

-- Minutes a sender must wait between nudges.
create or replace function public.nudge_cooldown_minutes()
returns integer
language sql
immutable
as $$ select 60 $$;

create or replace function public.send_nudge()
returns public.nudges
language plpgsql
security definer
set search_path = public
as $$
declare
  hid uuid := public.my_household_id();
  partner uuid;
  last_sent timestamptz;
  n public.nudges;
begin
  if hid is null then
    raise exception 'Join a household first';
  end if;

  select id into partner from public.profiles where household_id = hid and id <> auth.uid() limit 1;
  if partner is null then
    raise exception 'No partner to nudge yet';
  end if;

  select max(created_at) into last_sent from public.nudges where from_user = auth.uid();
  if last_sent > now() - make_interval(mins => public.nudge_cooldown_minutes()) then
    raise exception 'You nudged recently. Try again in % min',
      ceil(extract(epoch from (last_sent + make_interval(mins => public.nudge_cooldown_minutes()) - now())) / 60);
  end if;

  insert into public.nudges (household_id, from_user, to_user)
  values (hid, auth.uid(), partner)
  returning * into n;
  return n;
end;
$$;

grant execute on function public.send_nudge() to authenticated;

alter publication supabase_realtime add table public.nudges;
