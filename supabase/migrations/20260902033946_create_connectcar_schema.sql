/*
# ConnectCar Call Center Schema

## Overview
Creates the full schema for the ConnectCar call center agent pool application.

## New Tables

### profiles
Extends auth.users with agent/admin role and call center specific fields.
- id (uuid, PK, references auth.users)
- full_name (text)
- role (text: 'agent' | 'admin')
- status (text: 'available' | 'busy' | 'offline')
- phone (text, optional)
- created_at (timestamptz)

### companies
Companies that agents are assigned to handle calls for.
- id (uuid, PK)
- name (text, unique)
- industry (text)
- contact_name (text)
- contact_email (text)
- priority (text: 'low' | 'medium' | 'high' | 'critical')
- active (boolean, default true)
- created_at (timestamptz)

### agent_assignments
Many-to-many join between agents and companies.
- id (uuid, PK)
- agent_id (uuid, FK -> profiles.id)
- company_id (uuid, FK -> companies.id)
- notes (text)
- assigned_at (timestamptz)

## Security
- RLS enabled on all tables.
- Agents can read/update their own profile.
- Admins can read all profiles (via role check on their own profile).
- Companies and assignments are readable by all authenticated users, but only admins can insert/update/delete.

## Notes
1. The admin role is stored in the profiles table. Admins are identified by role = 'admin'.
2. A trigger auto-creates a profile row when a new auth.users row is inserted.
3. All policies use auth.uid() for ownership/role checks.
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'admin')),
  status text NOT NULL DEFAULT 'offline' CHECK (status IN ('available', 'busy', 'offline')),
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "admin_update_any_profile" ON profiles;
CREATE POLICY "admin_update_any_profile" ON profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  industry text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_companies" ON companies;
CREATE POLICY "authenticated_select_companies" ON companies FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_companies" ON companies;
CREATE POLICY "admin_insert_companies" ON companies FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "admin_update_companies" ON companies;
CREATE POLICY "admin_update_companies" ON companies FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "admin_delete_companies" ON companies;
CREATE POLICY "admin_delete_companies" ON companies FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Agent assignments table
CREATE TABLE IF NOT EXISTS agent_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  notes text DEFAULT '',
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(agent_id, company_id)
);

ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_assignments" ON agent_assignments;
CREATE POLICY "authenticated_select_assignments" ON agent_assignments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_assignments" ON agent_assignments;
CREATE POLICY "admin_insert_assignments" ON agent_assignments FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "admin_update_assignments" ON agent_assignments;
CREATE POLICY "admin_update_assignments" ON agent_assignments FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "admin_delete_assignments" ON agent_assignments;
CREATE POLICY "admin_delete_assignments" ON agent_assignments FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Trigger: auto-create profile on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'agent')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Seed a few example companies
INSERT INTO companies (name, industry, contact_name, contact_email, priority)
VALUES
  ('AutoNation Group', 'Automotive Retail', 'Sarah Mitchell', 'smitchell@autonation.com', 'high'),
  ('Carvana LLC', 'Online Auto Sales', 'James Porter', 'jporter@carvana.com', 'critical'),
  ('DriveTime Automotive', 'Used Car Dealerships', 'Linda Ortiz', 'lortiz@drivetime.com', 'medium'),
  ('CarMax Inc.', 'Automotive Retail', 'Robert Chen', 'rchen@carmax.com', 'high'),
  ('Vroom Inc.', 'Online Auto Sales', 'Patricia Wang', 'pwang@vroom.com', 'low')
ON CONFLICT (name) DO NOTHING;
