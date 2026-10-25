-- RLS tests for FP-16 saved household meals. Run with scripts/test-db.sh.
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

\echo '--- Saving'
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
insert into saved_meals (household_id, name, calories, protein_g, created_by)
  values (my_household_id(), 'Chicken and rice', 620, 48, auth.uid());
select assert((select count(*) from saved_meals) = 1, 'creator sees saved meal');
do $$ begin
  insert into saved_meals (household_id, name, calories, protein_g, created_by)
    values (my_household_id(), '  chicken AND rice ', 500, 40, auth.uid());
  raise exception 'should have failed';
exception when unique_violation then perform assert(true, 'duplicate active name rejected'); end $$;
do $$ begin
  insert into saved_meals (household_id, name, calories, created_by)
    values (my_household_id(), 'Forged author', 100, '22222222-2222-2222-2222-222222222222');
  raise exception 'should have failed';
exception when insufficient_privilege then perform assert(true, 'cannot save as partner'); end $$;
commit;

\echo '--- Partner edits and removes'
begin; set local role authenticated; set local request.jwt.claim.sub = :'april';
select assert((select count(*) from saved_meals where name = 'Chicken and rice') = 1, 'partner sees saved meal');
update saved_meals set calories = 650 where name = 'Chicken and rice';
select assert((select calories from saved_meals where name = 'Chicken and rice') = 650, 'partner can edit');
update saved_meals set archived = true where name = 'Chicken and rice';
select assert((select archived from saved_meals where name = 'Chicken and rice'), 'partner can remove (archive)');
insert into saved_meals (household_id, name, calories, protein_g, created_by)
  values (my_household_id(), 'Chicken and rice', 600, 45, auth.uid());
select assert((select count(*) from saved_meals where not archived) = 1, 'removed name can be saved again');
commit;

\echo '--- Other households'
begin; set local role authenticated; set local request.jwt.claim.sub = :'eve';
select assert((select count(*) from saved_meals) = 0, 'other household cannot see saved meals');
update saved_meals set name = 'Hacked';
commit;
begin; set local role authenticated; set local request.jwt.claim.sub = :'josh';
select assert((select count(*) from saved_meals where name = 'Hacked') = 0, 'other household cannot edit');
do $$ begin
  update saved_meals set household_id = gen_random_uuid() where not archived;
  raise exception 'should have failed';
exception when insufficient_privilege then perform assert(true, 'cannot move meal to another household'); end $$;
commit;

begin;
select assert((select count(*) from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'saved_meals') = 1, 'saved_meals in realtime');
commit;
