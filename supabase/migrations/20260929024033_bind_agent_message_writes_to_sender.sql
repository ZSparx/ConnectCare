/*
  # Bind message writes to the actual sender

  1. Security
     - INSERT previously accepted `auth.uid() = sender_id` on its own, which
       left `agent_id` unconstrained: any signed-in user could drop a message
       into any other agent's inbox. Require the sender to be the caller and
       the thread to be the caller's own, or the caller to be an admin.
     - UPDATE previously matched every message addressed to the caller, so an
       agent could rewrite a recruiter's message body. Restrict to the sender
       or an admin.
*/

DROP POLICY IF EXISTS "insert_own_messages" ON public.agent_messages;
CREATE POLICY "insert_own_messages" ON public.agent_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (agent_id = auth.uid() OR private.is_admin())
  );

DROP POLICY IF EXISTS "update_own_messages" ON public.agent_messages;
CREATE POLICY "update_own_messages" ON public.agent_messages
  FOR UPDATE TO authenticated
  USING (sender_id = auth.uid() OR private.is_admin())
  WITH CHECK (sender_id = auth.uid() OR private.is_admin());

DROP POLICY IF EXISTS "select_own_messages" ON public.agent_messages;
CREATE POLICY "select_own_messages" ON public.agent_messages
  FOR SELECT TO authenticated
  USING (
    auth.uid() = agent_id
    OR auth.uid() = sender_id
    OR private.is_admin()
  );
