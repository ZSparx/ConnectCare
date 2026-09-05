/*
  # Restrict agent-to-company assignment reads

  1. Security
     - `authenticated_select_assignments` was `USING (true)`, exposing the full
       client roster and staffing map to any signed-in account. Narrow it to
       the caller's own assignments plus admins; the agent dashboard already
       filters by its own agent id and the admin dashboard is admin-only.
*/

DROP POLICY IF EXISTS "authenticated_select_assignments" ON public.agent_assignments;
CREATE POLICY "authenticated_select_assignments" ON public.agent_assignments
  FOR SELECT TO authenticated
  USING (auth.uid() = agent_id OR private.is_admin());
