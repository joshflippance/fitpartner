-- FP-16 saved household meals.
--
-- Josh's choices (2026-10-25):
--   * Simple saved meal: name, calories and protein per serving. Logged with a portion multiplier.
--   * Either partner can edit or remove any saved meal in the household.
-- Removing sets archived = true, so there is no hard removal path from the client.

create table public.saved_meals (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households (id) on delete cascade,
  name          text not null check (length(trim(name)) between 1 and 60),
  calories      integer not null check (calories >= 0 and calories < 10000),
  protein_g     numeric(6,1) not null default 0 check (protein_g >= 0 and protein_g < 1000),
  created_by    uuid references public.profiles (id) on delete set null,
  archived      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- One active meal per name in a household; a removed name can be saved again.
create unique index saved_meals_active_name_idx
  on public.saved_meals (household_id, lower(trim(name))) where not archived;
create index saved_meals_created_by_idx on public.saved_meals (created_by);

create trigger saved_meals_touch before update on public.saved_meals
  for each row execute function public.touch_updated_at();

alter table public.saved_meals enable row level security;

create policy "household reads" on public.saved_meals for select to authenticated
  using (household_id = (select public.my_household_id()));
create policy "household writes" on public.saved_meals for insert to authenticated
  with check (household_id = (select public.my_household_id()) and created_by = (select auth.uid()));
create policy "household updates" on public.saved_meals for update to authenticated
  using (household_id = (select public.my_household_id()))
  with check (household_id = (select public.my_household_id()));

alter publication supabase_realtime add table public.saved_meals;
