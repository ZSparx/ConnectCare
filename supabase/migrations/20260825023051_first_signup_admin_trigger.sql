/*
# First signup becomes admin

## Overview
Updates the handle_new_user() trigger function so that the very first
user to sign up is assigned the 'admin' role. Every subsequent signup
continues to receive 'agent' as before.

## Changes
1. Replaces the handle_new_user() function with a version that checks
   whether the profiles table is empty at insert time.
2. If the table is empty (no rows), the new user gets role = 'admin'.
3. If the table has any rows, the new user gets role = 'agent' (default).
4. The existing trigger on_auth_user_created is dropped and recreated
   to bind to the updated function.

## Security
- No changes to RLS policies. The admin_update_any_profile policy
  already allows admins to update any profile's role column.
- The trigger function remains SECURITY DEFINER so it can read the
  profiles table during the auth.users INSERT trigger.

## Notes
1. This is safe to re-run (CREATE OR REPLACE FUNCTION + DROP TRIGGER IF EXISTS).
2. No data is lost — only the trigger function definition changes.
3. If a user already signed up before this migration, they remain 'agent'
   unless manually promoted. Only the first signup AFTER this migration
   runs will get 'admin' if the table is empty at that time.
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  profile_count integer;
BEGIN
  SELECT count(*) INTO profile_count FROM profiles;
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    CASE WHEN profile_count = 0 THEN 'admin' ELSE 'agent' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
