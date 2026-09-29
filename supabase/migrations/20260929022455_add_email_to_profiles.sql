-- Add email column to profiles table so admin dashboard can display it
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Backfill existing profiles with their auth.users email
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Update the trigger to populate email on new signups
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
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    CASE WHEN profile_count = 0 THEN 'admin' ELSE 'agent' END,
    new.email
  )
  ON CONFLICT (id) DO UPDATE SET email = new.email;
  RETURN new;
END;
$$;