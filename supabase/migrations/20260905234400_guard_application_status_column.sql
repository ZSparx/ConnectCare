/*
  # Protect application status from applicant edits

  1. Security
     - BEFORE UPDATE trigger on `agent_applications` preserves `OLD.status`
       unless the caller is an admin, so applicants cannot advance themselves
       through the recruitment pipeline. Initial submission (INSERT) is
       unaffected.
*/

CREATE OR REPLACE FUNCTION public.guard_application_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT private.is_admin() THEN
    NEW.status := OLD.status;
    NEW.agent_id := OLD.agent_id;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_application_status() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS guard_application_status_trg ON public.agent_applications;
CREATE TRIGGER guard_application_status_trg
  BEFORE UPDATE ON public.agent_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_application_status();
