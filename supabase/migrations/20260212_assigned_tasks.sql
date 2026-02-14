-- Assignment Tracking Table
CREATE TABLE IF NOT EXISTS assigned_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT[], -- array of strings
  assigned_by TEXT DEFAULT 'Ashan',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ,
  status TEXT CHECK (status IN ('PENDING', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'OVERDUE')) DEFAULT 'PENDING',
  priority TEXT CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')) DEFAULT 'MEDIUM',
  executor TEXT CHECK (executor IN ('ava', 'antigravity', 'maya', 'pam')) DEFAULT 'ava',
  notes TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assigned_tasks_status ON assigned_tasks(status);
CREATE INDEX IF NOT EXISTS idx_assigned_tasks_priority ON assigned_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_assigned_tasks_deadline ON assigned_tasks(deadline);

-- Enable RLS
ALTER TABLE assigned_tasks ENABLE ROW LEVEL SECURITY;

-- Policy (single user app, allow all)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON assigned_tasks;
CREATE POLICY "Allow all for authenticated users" ON assigned_tasks
  FOR ALL USING (auth.role() = 'authenticated');

-- Updated at trigger (create function if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_assigned_tasks_updated_at ON assigned_tasks;
CREATE TRIGGER update_assigned_tasks_updated_at 
  BEFORE UPDATE ON assigned_tasks
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
