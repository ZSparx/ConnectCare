/*
  # Restrict application status history writes

  1. Security
     - The INSERT check accepted any row where `agent_id = auth.uid()`, letting
       an applicant fabricate a recruiter decision (any `status`, any
       `changed_by`). Applicants may now only record the single 'submitted'
       entry the application form writes, attributed to themselves; every other
       history entry must come from an admin.
*/

DROP POLICY IF EXISTS "insert_status_history" ON public.agent_status_history;
CREATE POLICY "insert_status_history" ON public.agent_status_history
  FOR INSERT TO authenticated
  WITH CHECK (
    (
      auth.uid() = agent_id
      AND changed_by = auth.uid()
      AND status = 'submitted'
    )
    OR private.is_admin()
  );

DROP POLICY IF EXISTS "select_own_status_history" ON public.agent_status_history;
CREATE POLICY "select_own_status_history" ON public.agent_status_history
  FOR SELECT TO authenticated
  USING (auth.uid() = agent_id OR private.is_admin());
