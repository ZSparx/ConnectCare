/*
# Fix handle_new_user search_path

## Overview
The handle_new_user() trigger function is SECURITY DEFINER but has no
explicit search_path. Supabase requires an explicit search_path on
SECURITY DEFINER functions to prevent search_path hijacking and to
ensure table references resolve correctly. Without it, the signup
trigger fails with "Database error saving new user".

## Changes
1. Replaces handle_new_user() with the same logic but adds
   SET search_path = public, auth.
2. The first-signup-becomes-admin logic is preserved.

## Notes
1. Safe to re-run (CREATE OR REPLACE FUNCTION).
2. No data is lost — only the function definition changes.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  profile_count integer;
BEGIN
  SELECT count(*) INTO profile_count FROM public.profiles;
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    CASE WHEN profile_count = 0 THEN 'admin' ELSE 'agent' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;
