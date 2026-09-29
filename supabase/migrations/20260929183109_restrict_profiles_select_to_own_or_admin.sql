/*
  # Restrict the profile directory

  1. Security
     - `profiles` SELECT was `USING (true)`, publishing every name, phone
       number and email address to any signed-in account. Narrow it to the
       caller's own row plus admins, using the non-recursive
       `private.is_admin()` helper.
     - The admin_update_any_profile policy is rewritten onto the same helper
       so it no longer runs a recursive subquery on `profiles`.
*/

DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR private.is_admin());

DROP POLICY IF EXISTS "admin_update_any_profile" ON public.profiles;
CREATE POLICY "admin_update_any_profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());
