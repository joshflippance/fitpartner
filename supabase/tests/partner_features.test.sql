-- RLS and trigger tests for FP-09 (Pinky Promise, nudges) and FP-10 (privacy).
-- Run with scripts/test-db.sh. Each check raises on failure.
\set ON_ERROR_STOP 1
\set josh  '11111111-1111-1111-1111-111111111111'
\set april '22222222-2222-2222-2222-222222222222'
\set eve   '33333333-3333-3333-3333-333333333333'

insert into auth.users (id, email) values (:'josh','josh@x.test'), (:'april','april@x.test'), (:'eve','eve@x.test');

-- Assertion helper (as superuser, callable by anyone).
create function public.assert(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ASSERT FAILED: %', msg; end if; raise notice 'ok: %', msg; end $$;
grant execute on function public.assert(boolean, text) to authenticated;

-- Josh creates a household; April joins; Eve is solo.
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
select pair_code as code from public.create_household('Home') \gset
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'april';
select public.join_household(:'code');
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'eve';
select public.create_household('Solo');
commit;

\echo '--- Pinky Promise'
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
insert into workout_logs (user_id, household_id, log_date, name)
  values (:'josh', my_household_id(), current_date, 'Today lift');
insert into workout_logs (user_id, household_id, log_date, name, status)
  values (:'josh', my_household_id(), current_date - 2, 'Two days late', 'pending');
insert into workout_logs (user_id, household_id, log_date, name, status)
  values (:'josh', my_household_id(), current_date - 5, 'Late lift', 'counted');
insert into workout_logs (user_id, household_id, log_date, name)
  values (:'josh', my_household_id(), current_date - 6, 'Late lift 2');
select assert((select status from workout_logs where name = 'Today lift') = 'counted', 'on-time workout counts');
select assert((select status from workout_logs where name = 'Two days late') = 'counted', '2 days late still counts, client cannot force pending');
select assert((select status from workout_logs where name = 'Late lift') = 'pending', '5 days late is pending even if client sends counted');
update workout_logs set status = 'counted', name = 'Late lift renamed' where name = 'Late lift';
select assert((select status from workout_logs where name = 'Late lift renamed') = 'pending', 'owner cannot self-approve via update');
update workout_logs set log_date = current_date where name = 'Late lift 2';
select assert((select status from workout_logs where name = 'Late lift 2') = 'counted', 'moving date to on-time re-derives counted');
update workout_logs set log_date = current_date - 6 where name = 'Late lift 2';
select assert((select status from workout_logs where name = 'Late lift 2') = 'pending', 'moving date late again re-derives pending');
do $$ begin
  perform review_workout((select id from workout_logs where name = 'Late lift renamed'), true);
  raise exception 'should have failed';
exception when others then
  perform assert(sqlerrm = 'Your partner has to review this one', 'owner cannot review own workout');
end $$;
commit;

begin; set local role authenticated; set local request.jwt.claim.sub = :'april';
select review_workout((select id from workout_logs where name = 'Late lift renamed'), true);
select assert((select status from workout_logs where name = 'Late lift renamed') = 'counted', 'partner approves, now counted');
select assert((select reviewed_by from workout_logs where name = 'Late lift renamed') = :'april', 'reviewer recorded');
select review_workout((select id from workout_logs where name = 'Late lift 2'), false);
select assert((select status from workout_logs where name = 'Late lift 2') = 'declined', 'partner declines');
do $$ begin
  perform review_workout((select id from workout_logs where name = 'Late lift 2'), true);
  raise exception 'should have failed';
exception when others then perform assert(sqlerrm = 'Already reviewed', 'cannot review twice'); end $$;
commit;

begin; set local role authenticated; set local request.jwt.claim.sub = :'eve';
insert into workout_logs (user_id, household_id, log_date, name) values (:'eve', my_household_id(), current_date - 6, 'Solo late');
select assert((select status from workout_logs where name = 'Solo late') = 'counted', 'solo household: late workout counts');
do $$ begin
  perform review_workout((select id from workout_logs where user_id <> auth.uid() limit 1), true);
exception when others then null; end $$;
select assert((select count(*) from workout_logs where user_id <> auth.uid()) = 0, 'other household workouts invisible');
commit;

\echo '--- Privacy'
begin; set local role authenticated; set local request.jwt.claim.sub = :'april';
insert into weight_logs (user_id, household_id, log_date, weight_kg) values (:'april', my_household_id(), current_date, 60);
insert into meal_logs (user_id, household_id, log_date, name, calories, protein_g) values (:'april', my_household_id(), current_date, 'Oats', 400, 20);
update profiles set share_weight = false where id = auth.uid();
select assert((select count(*) from weight_logs) = 1, 'owner still sees own private weight');
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
select assert((select count(*) from weight_logs where user_id = :'april') = 0, 'partner cannot read private weight');
select assert((select count(*) from meal_logs where user_id = :'april') = 1, 'partner still reads shared meals');
select assert((select share_weight from profiles where id = :'april') = false, 'partner can read the sharing flag');
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'april';
update profiles set share_meals = false, share_weight = true where id = auth.uid();
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
select assert((select count(*) from meal_logs where user_id = :'april') = 0, 'partner cannot read private meals');
select assert((select count(*) from weight_logs where user_id = :'april') = 1, 're-shared weight visible again');
do $$ begin
  update profiles set share_weight = false where id = '22222222-2222-2222-2222-222222222222';
end $$;
commit;
select assert((select share_weight from profiles where id = :'april'), 'partner cannot change my sharing flags');

\echo '--- Nudges'
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
select send_nudge();
do $$ begin perform send_nudge(); raise exception 'should have failed';
exception when others then perform assert(sqlerrm like 'You nudged recently%', 'cooldown blocks a second nudge'); end $$;
do $$ begin
  insert into nudges (household_id, from_user, to_user) values (my_household_id(), auth.uid(), '22222222-2222-2222-2222-222222222222');
  raise exception 'should have failed';
exception when insufficient_privilege then perform assert(true, 'direct insert blocked'); end $$;
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'april';
select assert((select count(*) from nudges where to_user = auth.uid() and seen_at is null) = 1, 'recipient sees unseen nudge');
update nudges set seen_at = now() where to_user = auth.uid();
select assert((select count(*) from nudges where seen_at is not null) = 1, 'recipient marks seen');
do $$ begin
  update nudges set to_user = from_user;
  raise exception 'should have failed';
exception when insufficient_privilege then perform assert(true, 'recipient cannot edit other columns'); end $$;
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'eve';
select assert((select count(*) from nudges) = 0, 'other household cannot see nudges');
do $$ begin perform send_nudge(); raise exception 'should have failed';
exception when others then perform assert(sqlerrm = 'No partner to nudge yet', 'solo user cannot nudge'); end $$;
commit;

\echo '--- Existing rules still hold'
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
do $$ begin
  insert into meal_logs (user_id, household_id, log_date, name, calories) values (auth.uid(), my_household_id(), current_date - 30, 'Old', 100);
  raise exception 'should have failed';
exception when insufficient_privilege then perform assert(true, 'date window still enforced'); end $$;
commit;
\echo 'ALL DB TESTS PASSED'
