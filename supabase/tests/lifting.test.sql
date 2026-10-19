-- RLS tests for FP-15 lifting: locations, exercises, routines, copies and sets.
-- Run with scripts/test-db.sh. Each check raises on failure.
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

\echo '--- Library and custom exercises'
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
select assert((select count(*) from exercises where household_id is null) >= 40, 'starter library visible');
insert into exercises (household_id, name, muscle_group, equipment, created_by)
  values (my_household_id(), 'Landmine Press', 'shoulders', '{barbell}', auth.uid());
do $$ begin
  insert into exercises (household_id, name, muscle_group, created_by) values (null, 'Fake Library Lift', 'chest', auth.uid());
  raise exception 'should have failed';
exception when insufficient_privilege then perform assert(true, 'cannot add to starter library'); end $$;
do $$ begin
  update exercises set name = 'Hacked' where household_id is null;
  perform assert((select count(*) from exercises where name = 'Hacked') = 0, 'cannot edit starter library');
end $$;
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'april';
select assert((select count(*) from exercises where name = 'Landmine Press') = 1, 'partner sees custom exercise');
update exercises set name = 'Changed by April' where name = 'Landmine Press';
select assert((select count(*) from exercises where name = 'Landmine Press') = 1, 'partner cannot edit creator''s exercise');
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'eve';
select assert((select count(*) from exercises where name = 'Landmine Press') = 0, 'other household cannot see custom exercise');
commit;

\echo '--- Locations'
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
insert into locations (household_id, name, equipment, created_by) values (my_household_id(), 'Home', '{dumbbells,bench}', auth.uid());
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'april';
update locations set equipment = '{dumbbells,bench,pull_up_bar}' where name = 'Home';
select assert((select 'pull_up_bar' = any(equipment) from locations where name = 'Home'), 'partner can edit shared location');
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'eve';
select assert((select count(*) from locations) = 0, 'other household cannot see locations');
commit;

\echo '--- Routines and copies'
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
insert into routines (household_id, owner_id, name) values (my_household_id(), auth.uid(), 'Push day');
insert into routine_exercises (routine_id, exercise_id, position, target_sets, rep_min, rep_max)
  select (select id from routines where name = 'Push day'), id, 0, 3, 8, 12 from exercises where name = 'Dumbbell Bench Press';
insert into routine_exercises (routine_id, exercise_id, position)
  select (select id from routines where name = 'Push day'), id, 1 from exercises where name = 'Lateral Raise';
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'april';
select assert((select count(*) from routine_exercises re join routines r on r.id = re.routine_id where r.name = 'Push day') = 2, 'partner sees routine and its exercises');
update routines set name = 'April renamed' where name = 'Push day';
select assert((select count(*) from routines where name = 'Push day') = 1, 'partner cannot edit owner''s routine');
do $$ begin
  insert into routine_exercises (routine_id, exercise_id) select (select id from routines where name = 'Push day'), id from exercises where name = 'Push-up';
  raise exception 'should have failed';
exception when insufficient_privilege then perform assert(true, 'partner cannot add to owner''s routine'); end $$;
do $$ begin
  perform save_routine_exercises((select id from routines where name = 'Push day'), '[]'::jsonb);
  raise exception 'should have failed';
exception when others then perform assert(sqlerrm = 'Routine not found', 'partner cannot replace owner''s exercise list'); end $$;
select copy_routine((select id from routines where name = 'Push day'), 'April push');
select assert((select owner_id from routines where name = 'April push') = :'april', 'copy owned by partner');
select assert((select count(*) from routine_exercises re join routines r on r.id = re.routine_id where r.name = 'April push') = 2, 'copy includes exercises');
update routine_exercises set rep_min = 5, rep_max = 5
  where routine_id = (select id from routines where name = 'April push');
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
select assert((select bool_and(rep_max = 12 or rep_max = 12) from routine_exercises re join routines r on r.id = re.routine_id where r.name = 'Push day' and re.position = 0), 'original unchanged by copy edits');
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'eve';
do $$ begin
  perform copy_routine((select id from routines limit 1), 'stolen');
exception when others then null; end $$;
select assert((select count(*) from routines where name = 'stolen') = 0, 'other household cannot copy');
do $$ begin
  perform copy_routine('00000000-0000-0000-0000-000000000000', 'x');
  raise exception 'should have failed';
exception when others then perform assert(sqlerrm = 'Routine not found', 'unknown routine rejected'); end $$;
commit;

begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
select save_routine_exercises((select id from routines where name = 'Push day'),
  (select jsonb_agg(jsonb_build_object('exercise_id', id, 'target_sets', 4, 'rep_min', 6, 'rep_max', 10)) from exercises
   where name in ('Dumbbell Bench Press', 'Lateral Raise', 'Push-up')));
select assert((select count(*) from routine_exercises re join routines r on r.id = re.routine_id where r.name = 'Push day') = 3, 'owner replaces exercise list atomically');
select assert((select min(rep_min) = 6 and max(target_sets) = 4 from routine_exercises re join routines r on r.id = re.routine_id where r.name = 'Push day'), 'new targets saved');
select assert((select count(*) from routine_exercises re join routines r on r.id = re.routine_id where r.name = 'April push') = 2, 'copy unaffected');
commit;

\echo '--- Sets'
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
insert into workout_logs (user_id, household_id, log_date, name, routine_id, location_id, started_at)
  values (auth.uid(), my_household_id(), current_date, 'Push day',
          (select id from routines where name = 'Push day'), (select id from locations where name = 'Home'), now());
insert into workout_sets (workout_id, user_id, household_id, exercise_id, set_number, reps, weight_kg)
  select (select id from workout_logs where name = 'Push day'), auth.uid(), my_household_id(), id, 1, 10, 22.5
  from exercises where name = 'Dumbbell Bench Press';
select assert((select count(*) from workout_sets) = 1, 'owner logs a set');
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'april';
select assert((select count(*) from workout_sets) = 1, 'partner sees sets');
do $$ begin
  insert into workout_sets (workout_id, user_id, household_id, exercise_id, set_number, reps)
    select (select id from workout_logs where name = 'Push day'), auth.uid(), my_household_id(), id, 2, 5 from exercises where name = 'Push-up';
  raise exception 'should have failed';
exception when insufficient_privilege then perform assert(true, 'partner cannot add sets to my workout'); end $$;
update workout_sets set reps = 99;
select assert((select reps from workout_sets limit 1) = 10, 'partner cannot edit my sets');
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'eve';
select assert((select count(*) from workout_sets) = 0, 'other household cannot see sets');
commit;
-- Old workouts are closed for set edits.
update workout_logs set log_date = current_date - 20 where name = 'Push day';
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
update workout_sets set reps = 11;
select assert((select reps from workout_sets limit 1) = 10, 'sets on closed workouts cannot be edited');
commit;
\echo 'LIFTING TESTS PASSED'
