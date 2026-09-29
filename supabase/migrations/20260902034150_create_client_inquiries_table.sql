/*
# Create client_inquiries table

## Purpose
Stores inquiries from potential clients (companies) who want to learn about
Connect Care's BPO services. Submitted from the public landing page inquiry
form — no sign-in required.

## New Table: client_inquiries
- id (uuid, PK)
- company_name (text) — the inquiring company's name
- contact_name (text) — the person submitting the inquiry
- email (text) — email address for follow-up
- phone (text, optional) — phone number if provided
- service_interest (text) — which BPO service they're interested in
- message (text) — free-text description of their needs
- status (text) — 'new' | 'contacted' — tracks follow-up state
- created_at (timestaptz)

## Security
- RLS enabled.
- INSERT: anyone (anon + authenticated) can submit an inquiry — the form is public.
- SELECT/UPDATE/DELETE: only admins can read and manage inquiries.
  Admin check uses the existing profiles.role = 'admin' pattern.
*/

CREATE TABLE IF NOT EXISTS client_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  service_interest text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE client_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an inquiry (public form, no sign-in required)
DROP POLICY IF EXISTS "anon_insert_inquiries" ON client_inquiries;
CREATE POLICY "anon_insert_inquiries" ON client_inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Only admins can read inquiries
DROP POLICY IF EXISTS "admin_select_inquiries" ON client_inquiries;
CREATE POLICY "admin_select_inquiries" ON client_inquiries FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Only admins can update inquiries (e.g. mark as contacted)
DROP POLICY IF EXISTS "admin_update_inquiries" ON client_inquiries;
CREATE POLICY "admin_update_inquiries" ON client_inquiries FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Only admins can delete inquiries
DROP POLICY IF EXISTS "admin_delete_inquiries" ON client_inquiries;
CREATE POLICY "admin_delete_inquiries" ON client_inquiries FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Index for admin sorting by most recent
CREATE INDEX IF NOT EXISTS idx_client_inquiries_created_at ON client_inquiries (created_at DESC);
