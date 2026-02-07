-- Ava Dashboard Database Schema
-- Created: 2026-02-07

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agents table (tracks sub-agents and main session)
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  task TEXT,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'blocked', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_milestone TEXT,
  last_update TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error TEXT,
  discoveries JSONB DEFAULT '[]'::jsonb,
  blockers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table (mirrors queue.json)
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
  status TEXT NOT NULL CHECK (status IN ('READY', 'BLOCKED', 'PENDING', 'IN_PROGRESS', 'COMPLETED')),
  blockers JSONB DEFAULT '[]'::jsonb,
  dependencies JSONB DEFAULT '[]'::jsonb,
  time_estimate TEXT,
  description TEXT,
  deliverables JSONB DEFAULT '[]'::jsonb,
  assigned_to TEXT REFERENCES agents(id),
  context_type TEXT,
  notes TEXT,
  independent BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Blockers table
CREATE TABLE blockers (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('permission', 'api-key', 'dependency', 'infrastructure', 'other')),
  resource TEXT NOT NULL,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  discovered_by TEXT,
  resolved_at TIMESTAMPTZ,
  alerted_user BOOLEAN DEFAULT false,
  priority_impact TEXT CHECK (priority_impact IN ('P0', 'P1', 'P2', 'P3')),
  impacts JSONB DEFAULT '[]'::jsonb,
  details TEXT,
  resolution TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved'))
);

-- Heartbeat status table (main session)
CREATE TABLE heartbeat_status (
  id SERIAL PRIMARY KEY,
  call INTEGER NOT NULL,
  rotation_index INTEGER NOT NULL CHECK (rotation_index >= 0 AND rotation_index <= 3),
  last_category TEXT,
  last_run TIMESTAMPTZ NOT NULL,
  last_user_message TIMESTAMPTZ,
  idle_since TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log (all events)
CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  event_type TEXT NOT NULL,
  agent_id TEXT REFERENCES agents(id),
  task_id TEXT REFERENCES tasks(id),
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_last_update ON agents(last_update DESC);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_blockers_status ON blockers(status);
CREATE INDEX idx_activity_log_timestamp ON activity_log(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE heartbeat_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for authenticated users - single user app)
CREATE POLICY "Allow all for authenticated users" ON agents
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON tasks
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON blockers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON heartbeat_status
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON activity_log
  FOR ALL USING (auth.role() = 'authenticated');

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
