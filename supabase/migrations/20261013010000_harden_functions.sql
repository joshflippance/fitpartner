-- Security advisor fixes.
-- 1. Pin search_path on the remaining helper functions.
-- 2. Functions are not callable by signed-out visitors. Signed-in users keep only
--    the RPCs the app calls; trigger functions aren't callable through the API at all.

alter function public.generate_pair_code() set search_path = public;
alter function public.late_log_days() set search_path = public;
alter function public.nudge_cooldown_minutes() set search_path = public;

revoke execute on all functions in schema public from public, anon;

revoke execute on function public.handle_new_user() from authenticated;
revoke execute on function public.workout_status_guard() from authenticated;
revoke execute on function public.generate_pair_code() from authenticated;

grant execute on function
  public.create_household(text),
  public.join_household(text),
  public.leave_household(),
  public.my_household_id(),
  public.can_see(uuid, text),
  public.review_workout(uuid, boolean),
  public.send_nudge(),
  public.late_log_days(),
  public.nudge_cooldown_minutes()
to authenticated;

-- New functions in this schema default to no public access.
alter default privileges in schema public revoke execute on functions from public, anon;
