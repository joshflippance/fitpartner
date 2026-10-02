-- FP-02: entries can be created or edited only for recent dates.
-- The app limits logging to the current and previous week (Monday start).
-- The database enforces a slightly wider window (15 days back, 1 day ahead)
-- so device time zones never block a valid entry, while old streak weeks stay closed.

do $$
declare
  t text;
begin
  foreach t in array array['weight_logs', 'meal_logs', 'workout_logs'] loop
    execute format('drop policy if exists "own inserts" on public.%I', t);
    execute format('drop policy if exists "own updates" on public.%I', t);

    execute format(
      'create policy "own inserts" on public.%I for insert to authenticated
         with check (
           user_id = auth.uid()
           and household_id = public.my_household_id()
           and log_date between current_date - 15 and current_date + 1
         )', t);

    execute format(
      'create policy "own updates" on public.%I for update to authenticated
         using (user_id = auth.uid() and log_date >= current_date - 15)
         with check (
           user_id = auth.uid()
           and household_id = public.my_household_id()
           and log_date between current_date - 15 and current_date + 1
         )', t);
  end loop;
end;
$$;
