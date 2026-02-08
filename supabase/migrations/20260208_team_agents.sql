-- Team Agents table
-- Created: 2026-02-08
-- Purpose: Track employee agent roster, status, and workload

CREATE TABLE team_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT,
  role TEXT NOT NULL,
  specialties JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'queued', 'working', 'blocked')),
  current_task JSONB, -- { id, name, progress, startedAt }
  queue_tasks JSONB[] DEFAULT ARRAY[]::jsonb[],
  last_active TIMESTAMP WITH TIME ZONE,
  total_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_team_agents_status ON team_agents(status);
CREATE INDEX idx_team_agents_last_active ON team_agents(last_active DESC);
CREATE INDEX idx_team_agents_agent_id ON team_agents(agent_id);

-- RLS policies
ALTER TABLE team_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON team_agents 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON team_agents 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON team_agents 
  FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable delete for authenticated users" ON team_agents 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Trigger to update updated_at
CREATE TRIGGER update_team_agents_updated_at 
  BEFORE UPDATE ON team_agents
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Seed data: initial agent roster
INSERT INTO team_agents (agent_id, name, emoji, role, specialties, status) VALUES
  ('iris', 'Iris', '🎨', 'Content Creator', '["image-generation", "video-generation", "visual-content"]'::jsonb, 'idle'),
  ('atlas', 'Atlas', '🔧', 'Code Builder', '["full-stack", "api-integration", "debugging"]'::jsonb, 'idle'),
  ('scout', 'Scout', '🔍', 'Research & Strategy', '["market-research", "competitive-analysis", "trend-analysis"]'::jsonb, 'idle'),
  ('pulse', 'Pulse', '💬', 'Social Media Manager', '["dm-automation", "engagement", "content-scheduling"]'::jsonb, 'idle'),
  ('forge', 'Forge', '🏗️', 'Infrastructure & DevOps', '["deployment", "ci-cd", "monitoring"]'::jsonb, 'idle');

COMMENT ON TABLE team_agents IS 'Employee agent roster with real-time status tracking';
COMMENT ON COLUMN team_agents.status IS 'idle = no work | queued = assigned but waiting for capacity | working = actively processing | blocked = has blocker';
COMMENT ON COLUMN team_agents.current_task IS 'Currently executing task (null if idle)';
COMMENT ON COLUMN team_agents.queue_tasks IS 'Array of queued tasks waiting to be processed';
