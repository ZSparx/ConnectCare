/*
  # Remove trigger functions from the public API surface

  1. Security
     - `public.handle_new_user()` is a SECURITY DEFINER trigger function that
       writes to `profiles`; EXECUTE was held by PUBLIC, so it was reachable at
       /rest/v1/rpc/handle_new_user by anonymous and signed-in callers.
       Revoke it. The trigger on auth.users runs as the table owner and is
       unaffected.
*/

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_profile_privileged_columns() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_application_status() FROM PUBLIC, anon, authenticated;
