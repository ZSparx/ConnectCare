/*
# Global Virtual Call Center Agent Pool Schema

## Overview
Extends the existing Connect Care schema to support a global, multi-country
virtual call-center agent recruitment and management system. Reuses the
existing `profiles`, `companies`, and `agent_assignments` tables and the
existing auth trigger. All new tables are RLS-enabled with ownership-scoped
policies for agents and admin-scoped policies for recruiters/admins.

## New Tables

### countries
Admin-configurable country registry. Drives the country dropdown and
eligibility rules. Not hard-coded — admins add/update countries from the
admin dashboard.
- id (uuid, PK)
- name (text, unique) — display name
- iso_code (text, unique) — ISO 3166-1 alpha-2 code
- application_status (text) — 'accepting' | 'review_required' | 'temp_closed' | 'not_available'
- notes (text)
- created_at, updated_at (timestamptz)

### agent_applications
One application per agent. Links to profiles.id (auth user). Stores the
application status, referral source, and flags for recruiter review.
- id (uuid, PK)
- agent_id (uuid, FK -> profiles.id, unique)
- status (text) — configurable application status
- referral_source (text)
- legally_authorized (text) — 'yes' | 'no' | 'not_sure'
- requires_review (boolean) — flagged when authorization unclear
- experience_summary (text)
- profile_completion (int) — 0-100
- submitted_at (timestamptz)
- created_at, updated_at (timestamptz)

### agent_locations
Stores country (name + ISO code), region, city, time zone, and work location
type for each agent.
- id (uuid, PK)
- agent_id (uuid, FK -> profiles.id, unique)
- country_name (text)
- country_code (text) — ISO alpha-2
- region (text)
- city (text)
- time_zone (text)
- work_location_type (text) — 'home' | 'other_remote'
- currently_located_here (boolean)
- location_clarification (text)
- created_at, updated_at (timestamptz)

### agent_experience
Years of experience across categories + previous employers.
- id (uuid, PK)
- agent_id (uuid, FK -> profiles.id, unique)
- years_customer_service (int)
- years_bpo (int)
- years_remote (int)
- previous_employers (text)
- has_customer_service (boolean)
- has_sales (boolean)
- has_technical_support (boolean)
- has_billing (boolean)
- has_collections (boolean)
- has_chat_support (boolean)
- has_email_support (boolean)
- has_admin_support (boolean)
- summary (text)
- created_at, updated_at (timestamptz)

### agent_skills
Multiple skill rows per agent (one per skill selected).
- id (uuid, PK)
- agent_id (uuid, FK -> profiles.id)
- skill (text)
- created_at (timestamptz)

### agent_skills_other
Free-text additional skills for an agent.
- id (uuid, PK)
- agent_id (uuid, FK -> profiles.id, unique)
- skills_text (text)
- created_at, updated_at (timestamptz)

### agent_languages
One row per language per agent with proficiency level.
- id (uuid, PK)
- agent_id (uuid, FK -> profiles.id)
- language (text)
- proficiency (text) — 'basic' | 'intermediate' | 'advanced' | 'fluent'
- is_primary_local (boolean)
- created_at (timestamptz)

### agent_equipment
Computer, headset, webcam, workspace, backup power details.
- id (uuid, PK)
- agent_id (uuid, FK -> profiles.id, unique)
- has_computer (boolean)
- computer_manufacturer (text)
- computer_model (text)
- os (text)
- processor (text)
- ram (text)
- has_headset (boolean)
- headset_model (text)
- has_webcam (boolean)
- dedicated_workspace (boolean)
- quiet_workspace (boolean)
- private_workspace (boolean)
- has_backup_power (boolean)
- backup_power_description (text)
- created_at, updated_at (timestamptz)

### agent_internet
Primary/backup internet details + speed test reference.
- id (uuid, PK)
- agent_id (uuid, FK -> profiles.id, unique)
- primary_provider (text)
- connection_type (text)
- download_speed (text)
- upload_speed (text)
- backup_provider (text)
- has_backup_internet (boolean)
- speed_test_url (text) — storage path for optional screenshot
- created_at, updated_at (timestamptz)

### agent_availability
Availability preferences and workable time zones.
- id (uuid, PK)
- agent_id (uuid, FK -> profiles.id, unique)
- availability_type (text) — 'full_time' | 'part_time' | 'flexible'
- hours_per_week (int)
- days_available (text[])
- preferred_shift (text)
- earliest_start_date (date)
- current_employment_status (text)
- workable_time_zones (text[])
- custom_time_zone (text)
- created_at, updated_at (timestamptz)

### agent_opportunity_preferences
Multiple preference rows per agent.
- id (uuid, PK)
- agent_id (uuid, FK -> profiles.id)
- preference (text)
- created_at (timestamptz)

### agent_documents
Secure document references for onboarding. Only admins can read.
- id (uuid, PK)
- agent_id (uuid, FK -> profiles.id)
- category (text) — 'identity' | 'work_authorization' | 'equipment' | 'internet' | 'training' | 'other'
- file_path (text) — storage path
- file_name (text)
- uploaded_at (timestamptz)

### agent_status_history
Audit trail of application status changes.
- id (uuid, PK)
- agent_id (uuid, FK -> profiles.id)
- status (text)
- changed_by (uuid, FK -> profiles.id)
- note (text)
- created_at (timestamptz)

### agent_messages
Recruiter <-> agent messages.
- id (uuid, PK)
- agent_id (uuid, FK -> profiles.id)
- sender_id (uuid, FK -> profiles.id)
- body (text)
- read (boolean, default false)
- created_at (timestamptz)

### recruiter_notes
Internal notes from recruiters about agents.
- id (uuid, PK)
- agent_id (uuid, FK -> profiles.id)
- recruiter_id (uuid, FK -> profiles.id)
- note (text)
- created_at (timestamptz)

### opportunities
Client opportunities with configurable requirements.
- id (uuid, PK)
- title (text)
- description (text)
- status (text) — 'open' | 'closed' | 'paused'
- created_at, updated_at (timestamptz)

### opportunity_requirements
Configurable requirements per opportunity (country, language, experience,
skills, equipment, availability, time zone, training). Stored as flexible
key-value rows so admins can add requirement types without code changes.
- id (uuid, PK)
- opportunity_id (uuid, FK -> opportunities.id)
- requirement_type (text)
- requirement_value (text)
- created_at (timestamptz)

### application_status_config
Admin-configurable application statuses.
- id (uuid, PK)
- status (text, unique)
- label (text)
- is_active (boolean, default true)
- sort_order (int)
- created_at, updated_at (timestamptz)

## Security
- RLS enabled on all new tables.
- Agent-owned tables: agents can CRUD their own rows (auth.uid() = agent_id).
- Admin-only tables (countries, opportunities, requirements, status config,
  recruiter notes, documents): admins can CRUD; agents read where appropriate.
- Agent messages: agents read messages where they are the recipient; admins
  read all.
- All policies use auth.uid() and the existing profiles.role check.
*/

-- ============================================================
-- COUNTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  iso_code text UNIQUE NOT NULL,
  application_status text NOT NULL DEFAULT 'accepting'
    CHECK (application_status IN ('accepting', 'review_required', 'temp_closed', 'not_available')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_countries" ON countries;
CREATE POLICY "authenticated_select_countries" ON countries FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_countries" ON countries;
CREATE POLICY "admin_insert_countries" ON countries FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_update_countries" ON countries;
CREATE POLICY "admin_update_countries" ON countries FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_delete_countries" ON countries;
CREATE POLICY "admin_delete_countries" ON countries FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- AGENT APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'submitted',
  referral_source text DEFAULT '',
  legally_authorized text DEFAULT '' CHECK (legally_authorized IN ('', 'yes', 'no', 'not_sure')),
  requires_review boolean NOT NULL DEFAULT false,
  experience_summary text DEFAULT '',
  profile_completion int NOT NULL DEFAULT 0,
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE agent_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_application" ON agent_applications;
CREATE POLICY "select_own_application" ON agent_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_application" ON agent_applications;
CREATE POLICY "insert_own_application" ON agent_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "update_own_application" ON agent_applications;
CREATE POLICY "update_own_application" ON agent_applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = agent_id)
  WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "admin_update_application" ON agent_applications;
CREATE POLICY "admin_update_application" ON agent_applications FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- AGENT LOCATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  country_name text NOT NULL DEFAULT '',
  country_code text NOT NULL DEFAULT '',
  region text DEFAULT '',
  city text DEFAULT '',
  time_zone text DEFAULT '',
  work_location_type text DEFAULT 'home' CHECK (work_location_type IN ('home', 'other_remote')),
  currently_located_here boolean DEFAULT true,
  location_clarification text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE agent_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_location" ON agent_locations;
CREATE POLICY "select_own_location" ON agent_locations FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_location" ON agent_locations;
CREATE POLICY "insert_own_location" ON agent_locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "update_own_location" ON agent_locations;
CREATE POLICY "update_own_location" ON agent_locations FOR UPDATE
  TO authenticated
  USING (auth.uid() = agent_id)
  WITH CHECK (auth.uid() = agent_id);

-- ============================================================
-- AGENT EXPERIENCE
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  years_customer_service int DEFAULT 0,
  years_bpo int DEFAULT 0,
  years_remote int DEFAULT 0,
  previous_employers text DEFAULT '',
  has_customer_service boolean DEFAULT false,
  has_sales boolean DEFAULT false,
  has_technical_support boolean DEFAULT false,
  has_billing boolean DEFAULT false,
  has_collections boolean DEFAULT false,
  has_chat_support boolean DEFAULT false,
  has_email_support boolean DEFAULT false,
  has_admin_support boolean DEFAULT false,
  summary text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE agent_experience ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_experience" ON agent_experience;
CREATE POLICY "select_own_experience" ON agent_experience FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_experience" ON agent_experience;
CREATE POLICY "insert_own_experience" ON agent_experience FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "update_own_experience" ON agent_experience;
CREATE POLICY "update_own_experience" ON agent_experience FOR UPDATE
  TO authenticated
  USING (auth.uid() = agent_id)
  WITH CHECK (auth.uid() = agent_id);

-- ============================================================
-- AGENT SKILLS (multiple rows)
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE agent_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_skills" ON agent_skills;
CREATE POLICY "select_own_skills" ON agent_skills FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_skills" ON agent_skills;
CREATE POLICY "insert_own_skills" ON agent_skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "delete_own_skills" ON agent_skills;
CREATE POLICY "delete_own_skills" ON agent_skills FOR DELETE
  TO authenticated
  USING (auth.uid() = agent_id);

-- ============================================================
-- AGENT SKILLS OTHER (free text)
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_skills_other (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skills_text text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE agent_skills_other ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_skills_other" ON agent_skills_other;
CREATE POLICY "select_own_skills_other" ON agent_skills_other FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_skills_other" ON agent_skills_other;
CREATE POLICY "insert_own_skills_other" ON agent_skills_other FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "update_own_skills_other" ON agent_skills_other;
CREATE POLICY "update_own_skills_other" ON agent_skills_other FOR UPDATE
  TO authenticated
  USING (auth.uid() = agent_id)
  WITH CHECK (auth.uid() = agent_id);

-- ============================================================
-- AGENT LANGUAGES (multiple rows)
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  language text NOT NULL,
  proficiency text NOT NULL DEFAULT 'intermediate'
    CHECK (proficiency IN ('basic', 'intermediate', 'advanced', 'fluent')),
  is_primary_local boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE agent_languages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_languages" ON agent_languages;
CREATE POLICY "select_own_languages" ON agent_languages FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_languages" ON agent_languages;
CREATE POLICY "insert_own_languages" ON agent_languages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "delete_own_languages" ON agent_languages;
CREATE POLICY "delete_own_languages" ON agent_languages FOR DELETE
  TO authenticated
  USING (auth.uid() = agent_id);

-- ============================================================
-- AGENT EQUIPMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  has_computer boolean DEFAULT false,
  computer_manufacturer text DEFAULT '',
  computer_model text DEFAULT '',
  os text DEFAULT '',
  processor text DEFAULT '',
  ram text DEFAULT '',
  has_headset boolean DEFAULT false,
  headset_model text DEFAULT '',
  has_webcam boolean DEFAULT false,
  dedicated_workspace boolean DEFAULT false,
  quiet_workspace boolean DEFAULT false,
  private_workspace boolean DEFAULT false,
  has_backup_power boolean DEFAULT false,
  backup_power_description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE agent_equipment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_equipment" ON agent_equipment;
CREATE POLICY "select_own_equipment" ON agent_equipment FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_equipment" ON agent_equipment;
CREATE POLICY "insert_own_equipment" ON agent_equipment FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "update_own_equipment" ON agent_equipment;
CREATE POLICY "update_own_equipment" ON agent_equipment FOR UPDATE
  TO authenticated
  USING (auth.uid() = agent_id)
  WITH CHECK (auth.uid() = agent_id);

-- ============================================================
-- AGENT INTERNET
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_internet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  primary_provider text DEFAULT '',
  connection_type text DEFAULT '',
  download_speed text DEFAULT '',
  upload_speed text DEFAULT '',
  backup_provider text DEFAULT '',
  has_backup_internet boolean DEFAULT false,
  speed_test_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE agent_internet ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_internet" ON agent_internet;
CREATE POLICY "select_own_internet" ON agent_internet FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_internet" ON agent_internet;
CREATE POLICY "insert_own_internet" ON agent_internet FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "update_own_internet" ON agent_internet;
CREATE POLICY "update_own_internet" ON agent_internet FOR UPDATE
  TO authenticated
  USING (auth.uid() = agent_id)
  WITH CHECK (auth.uid() = agent_id);

-- ============================================================
-- AGENT AVAILABILITY
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  availability_type text DEFAULT 'flexible' CHECK (availability_type IN ('full_time', 'part_time', 'flexible')),
  hours_per_week int DEFAULT 0,
  days_available text[] DEFAULT '{}',
  preferred_shift text DEFAULT '',
  earliest_start_date date,
  current_employment_status text DEFAULT '',
  workable_time_zones text[] DEFAULT '{}',
  custom_time_zone text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE agent_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_availability" ON agent_availability;
CREATE POLICY "select_own_availability" ON agent_availability FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_availability" ON agent_availability;
CREATE POLICY "insert_own_availability" ON agent_availability FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "update_own_availability" ON agent_availability;
CREATE POLICY "update_own_availability" ON agent_availability FOR UPDATE
  TO authenticated
  USING (auth.uid() = agent_id)
  WITH CHECK (auth.uid() = agent_id);

-- ============================================================
-- AGENT OPPORTUNITY PREFERENCES (multiple rows)
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_opportunity_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  preference text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE agent_opportunity_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_opportunity_prefs" ON agent_opportunity_preferences;
CREATE POLICY "select_own_opportunity_prefs" ON agent_opportunity_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_opportunity_prefs" ON agent_opportunity_preferences;
CREATE POLICY "insert_own_opportunity_prefs" ON agent_opportunity_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "delete_own_opportunity_prefs" ON agent_opportunity_preferences;
CREATE POLICY "delete_own_opportunity_prefs" ON agent_opportunity_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = agent_id);

-- ============================================================
-- AGENT DOCUMENTS (admin-only read)
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'other'
    CHECK (category IN ('identity', 'work_authorization', 'equipment', 'internet', 'training', 'other')),
  file_path text NOT NULL DEFAULT '',
  file_name text DEFAULT '',
  uploaded_at timestamptz DEFAULT now()
);
ALTER TABLE agent_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_own_documents" ON agent_documents;
CREATE POLICY "insert_own_documents" ON agent_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "admin_select_documents" ON agent_documents;
CREATE POLICY "admin_select_documents" ON agent_documents FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_delete_documents" ON agent_documents;
CREATE POLICY "admin_delete_documents" ON agent_documents FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- AGENT STATUS HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL,
  changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  note text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE agent_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_status_history" ON agent_status_history;
CREATE POLICY "select_own_status_history" ON agent_status_history FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_status_history" ON agent_status_history;
CREATE POLICY "insert_status_history" ON agent_status_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- AGENT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body text NOT NULL DEFAULT '',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON agent_messages;
CREATE POLICY "select_own_messages" ON agent_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id OR auth.uid() = sender_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_messages" ON agent_messages;
CREATE POLICY "insert_own_messages" ON agent_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id OR auth.uid() = sender_id);

DROP POLICY IF EXISTS "update_own_messages" ON agent_messages;
CREATE POLICY "update_own_messages" ON agent_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = agent_id OR auth.uid() = sender_id)
  WITH CHECK (auth.uid() = agent_id OR auth.uid() = sender_id);

-- ============================================================
-- RECRUITER NOTES (admin-only)
-- ============================================================
CREATE TABLE IF NOT EXISTS recruiter_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recruiter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE recruiter_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_recruiter_notes" ON recruiter_notes;
CREATE POLICY "admin_select_recruiter_notes" ON recruiter_notes FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_insert_recruiter_notes" ON recruiter_notes;
CREATE POLICY "admin_insert_recruiter_notes" ON recruiter_notes FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_delete_recruiter_notes" ON recruiter_notes;
CREATE POLICY "admin_delete_recruiter_notes" ON recruiter_notes FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- OPPORTUNITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'paused')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_opportunities" ON opportunities;
CREATE POLICY "authenticated_select_opportunities" ON opportunities FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_opportunities" ON opportunities;
CREATE POLICY "admin_insert_opportunities" ON opportunities FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_update_opportunities" ON opportunities;
CREATE POLICY "admin_update_opportunities" ON opportunities FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_delete_opportunities" ON opportunities;
CREATE POLICY "admin_delete_opportunities" ON opportunities FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- OPPORTUNITY REQUIREMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS opportunity_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  requirement_type text NOT NULL,
  requirement_value text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE opportunity_requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_requirements" ON opportunity_requirements;
CREATE POLICY "authenticated_select_requirements" ON opportunity_requirements FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_requirements" ON opportunity_requirements;
CREATE POLICY "admin_insert_requirements" ON opportunity_requirements FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_delete_requirements" ON opportunity_requirements;
CREATE POLICY "admin_delete_requirements" ON opportunity_requirements FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- APPLICATION STATUS CONFIG
-- ============================================================
CREATE TABLE IF NOT EXISTS application_status_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text UNIQUE NOT NULL,
  label text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE application_status_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_status_config" ON application_status_config;
CREATE POLICY "authenticated_select_status_config" ON application_status_config FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_status_config" ON application_status_config;
CREATE POLICY "admin_insert_status_config" ON application_status_config FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_update_status_config" ON application_status_config;
CREATE POLICY "admin_update_status_config" ON application_status_config FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_delete_status_config" ON application_status_config;
CREATE POLICY "admin_delete_status_config" ON application_status_config FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO countries (name, iso_code, application_status, notes) VALUES
  ('Philippines', 'PH', 'accepting', ''),
  ('United States', 'US', 'accepting', ''),
  ('Canada', 'CA', 'review_required', ''),
  ('India', 'IN', 'accepting', ''),
  ('United Kingdom', 'GB', 'review_required', ''),
  ('Colombia', 'CO', 'accepting', ''),
  ('Mexico', 'MX', 'accepting', ''),
  ('South Africa', 'ZA', 'review_required', '')
ON CONFLICT (name) DO NOTHING;

INSERT INTO application_status_config (status, label, is_active, sort_order) VALUES
  ('submitted', 'Submitted', true, 1),
  ('under_review', 'Under Review', true, 2),
  ('interview', 'Interview', true, 3),
  ('info_required', 'Additional Information Required', true, 4),
  ('approved', 'Approved', true, 5),
  ('onboarding', 'Onboarding', true, 6),
  ('training', 'Training', true, 7),
  ('certified', 'Certified', true, 8),
  ('ready', 'Ready for Opportunities', true, 9),
  ('placed', 'Placed', true, 10),
  ('inactive', 'Inactive', true, 11),
  ('not_selected', 'Not Selected', true, 12)
ON CONFLICT (status) DO NOTHING;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_agent_skills_agent ON agent_skills(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_languages_agent ON agent_languages(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_opportunity_prefs_agent ON agent_opportunity_preferences(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_agent ON agent_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_status_history_agent ON agent_status_history(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_documents_agent ON agent_documents(agent_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_notes_agent ON recruiter_notes(agent_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_requirements_opp ON opportunity_requirements(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_agent_applications_status ON agent_applications(status);
CREATE INDEX IF NOT EXISTS idx_agent_locations_country ON agent_locations(country_code);
