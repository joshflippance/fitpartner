-- RLS and constraint tests for the planner migration. Run with scripts/test-db.sh.
\set ON_ERROR_STOP 1
\set josh  '11111111-1111-1111-1111-111111111111'
\set april '22222222-2222-2222-2222-222222222222'
\set eve   '33333333-3333-3333-3333-333333333333'

insert into auth.users (id, email) values (:'josh','josh@x.test'), (:'april','april@x.test'), (:'eve','eve@x.test')
  on conflict do nothing;

create or replace function public.assert(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ASSERT FAILED: %', msg; end if; raise notice 'ok: %', msg; end $$;
grant execute on function public.assert(boolean, text) to authenticated;

begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
select pair_code as code from public.create_household('Home') \gset
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'april';
select public.join_household(:'code');
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'eve';
select public.create_household('Solo');
commit;

\echo '--- Library'
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
select assert((select count(*) from exercises where household_id is null and kind = 'cardio') = 7, '7 starter cardio');
select assert((select count(*) from exercises where household_id is null and kind = 'warmup') = 8, '8 starter warm-ups');
select assert((select count(*) from exercises where household_id is null and kind = 'stretch') = 12, '12 starter stretches');
select assert((select count(*) from exercises where household_id is null and kind = 'strength') = 42, 'strength library unchanged');
do $$ begin
  insert into exercises (household_id, name, muscle_group, kind, created_by)
    values (my_household_id(), 'Bad kind', 'core', 'yoga', auth.uid());
  raise exception 'should have failed';
exception when check_violation then perform assert(true, 'unknown kind rejected'); end $$;
commit;

\echo '--- Programs'
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
insert into training_programs (user_id, household_id, split, days_per_week, minutes) values (auth.uid(), my_household_id(), 'ppl', 3, 45);
do $$ begin
  insert into training_programs (user_id, household_id) values ('22222222-2222-2222-2222-222222222222', my_household_id());
  raise exception 'should have failed';
exception when insufficient_privilege then perform assert(true, 'cannot create partner program'); end $$;
do $$ begin
  update training_programs set minutes = 50 where user_id = auth.uid();
  raise exception 'should have failed';
exception when check_violation then perform assert(true, 'minutes limited to 30, 45, 60, 75'); end $$;
select assert((select ai_enabled from training_programs where user_id = auth.uid()) = false, 'AI is off by default');
commit;

begin; set local role authenticated; set local request.jwt.claim.sub = :'april';
select assert((select split from training_programs where user_id = '11111111-1111-1111-1111-111111111111') = 'ppl', 'partner reads program');
update training_programs set split = 'circuit' where user_id = '11111111-1111-1111-1111-111111111111';
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
select assert((select split from training_programs where user_id = auth.uid()) = 'ppl', 'partner cannot change program');
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'eve';
select assert((select count(*) from training_programs) = 0, 'other household cannot read programs');
commit;

\echo '--- Timed blocks'
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
insert into workout_logs (user_id, household_id, log_date, name, started_at, plan)
  values (auth.uid(), my_household_id(), current_date, 'Push', now(), '{"day":"push","source":"rules"}');
insert into workout_blocks (workout_id, user_id, household_id, exercise_id, section, seconds)
  select w.id, auth.uid(), my_household_id(), e.id, 'warmup', 180
  from workout_logs w, exercises e where w.user_id = auth.uid() and e.name = 'Treadmill' and e.household_id is null;
insert into workout_blocks (workout_id, user_id, household_id, exercise_id, section, seconds)
  select w.id, auth.uid(), my_household_id(), e.id, 'cardio', 600
  from workout_logs w, exercises e where w.user_id = auth.uid() and e.name = 'Treadmill' and e.household_id is null;
select assert((select count(*) from workout_blocks) = 2, 'same machine logged in warm-up and as finisher');
do $$ begin
  insert into workout_blocks (workout_id, user_id, household_id, exercise_id, section, seconds)
    select w.id, auth.uid(), my_household_id(), e.id, 'cardio', 60
    from workout_logs w, exercises e where w.user_id = auth.uid() and e.name = 'Treadmill' and e.household_id is null;
  raise exception 'should have failed';
exception when unique_violation then perform assert(true, 'no double logging in one section'); end $$;
delete from workout_blocks where section = 'warmup';
select assert((select count(*) from workout_blocks) = 1, 'owner can undo a block');
select assert((select plan ->> 'day' from workout_logs where user_id = auth.uid()) = 'push', 'plan stored on workout');
commit;

begin; set local role authenticated; set local request.jwt.claim.sub = :'april';
select assert((select count(*) from workout_blocks) = 1, 'partner reads blocks');
do $$ begin
  insert into workout_blocks (workout_id, user_id, household_id, exercise_id, section, seconds)
    select w.id, auth.uid(), my_household_id(), e.id, 'stretch', 60
    from workout_logs w, exercises e where w.user_id = '11111111-1111-1111-1111-111111111111' and e.name = 'Plank';
  raise exception 'should have failed';
exception when insufficient_privilege then perform assert(true, 'cannot log into partner workout'); end $$;
update workout_blocks set seconds = 1;
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
select assert((select seconds from workout_blocks) = 600, 'partner cannot edit blocks');
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'eve';
select assert((select count(*) from workout_blocks) = 0, 'other household cannot read blocks');
commit;

begin;
select assert((select count(*) from pg_publication_tables where pubname = 'supabase_realtime'
               and tablename in ('workout_blocks', 'training_programs')) = 2, 'new tables in realtime');
commit;
