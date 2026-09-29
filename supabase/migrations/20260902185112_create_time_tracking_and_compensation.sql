/*
# Time Tracking & Compensation

Adds shift time tracking for agents (clock in/out) and admin-only hourly
compensation rates, so admins can calculate pay from logged hours.

- time_entries: agents select/insert/update their own rows; admins select all.
- agent_compensation: admin-only in every direction.

(Originally applied from Bolt; exported from the live database.)
*/

-- ============================================================
-- TIME ENTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clock_in timestamptz NOT NULL DEFAULT now(),
  clock_out timestamptz,
  duration_minutes int GENERATED ALWAYS AS (
    CASE WHEN clock_out IS NOT NULL
      THEN GREATEST(0, ROUND(EXTRACT(EPOCH FROM (clock_out - clock_in)) / 60))::int
      ELSE NULL
    END
  ) STORED,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_time_entries" ON time_entries;
CREATE POLICY "select_own_time_entries" ON time_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_time_entries" ON time_entries;
CREATE POLICY "insert_own_time_entries" ON time_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "update_own_time_entries" ON time_entries;
CREATE POLICY "update_own_time_entries" ON time_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = agent_id)
  WITH CHECK (auth.uid() = agent_id);

CREATE INDEX IF NOT EXISTS idx_time_entries_agent ON time_entries(agent_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_in ON time_entries(clock_in DESC);

-- ============================================================
-- AGENT COMPENSATION (admin-only, no agent access at all)
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_compensation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hourly_rate numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE agent_compensation ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_compensation" ON agent_compensation;
CREATE POLICY "admin_select_compensation" ON agent_compensation FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_insert_compensation" ON agent_compensation;
CREATE POLICY "admin_insert_compensation" ON agent_compensation FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_update_compensation" ON agent_compensation;
CREATE POLICY "admin_update_compensation" ON agent_compensation FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_delete_compensation" ON agent_compensation;
CREATE POLICY "admin_delete_compensation" ON agent_compensation FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
