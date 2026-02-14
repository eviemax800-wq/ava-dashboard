-- Migration: Command Center Dashboard Tables
-- Created: 2026-02-14
-- Purpose: Add tables for Dashboard V3 - Command Center

-- Revenue tracking table
CREATE TABLE IF NOT EXISTS revenue (
  id BIGSERIAL PRIMARY KEY,
  current_mrr INTEGER NOT NULL,
  products JSONB NOT NULL DEFAULT '{}'::jsonb,
  goals JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for latest revenue data
CREATE INDEX IF NOT EXISTS idx_revenue_updated_at ON revenue(updated_at DESC);

-- System health tracking table
CREATE TABLE IF NOT EXISTS system_health (
  id BIGSERIAL PRIMARY KEY,
  processes JSONB NOT NULL DEFAULT '{}'::jsonb,
  integrations JSONB NOT NULL DEFAULT '{}'::jsonb,
  uptime_7d NUMERIC(5,2),
  errors_24h JSONB NOT NULL DEFAULT '{"critical": 0, "warning": 0}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for latest system health data
CREATE INDEX IF NOT EXISTS idx_system_health_updated_at ON system_health(updated_at DESC);

-- Launch status tracking table
CREATE TABLE IF NOT EXISTS launch_status (
  id BIGSERIAL PRIMARY KEY,
  launch_date TIMESTAMPTZ,
  countdown_hours INTEGER,
  products JSONB NOT NULL DEFAULT '{}'::jsonb,
  marketing JSONB NOT NULL DEFAULT '{}'::jsonb,
  blockers JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for latest launch status
CREATE INDEX IF NOT EXISTS idx_launch_status_updated_at ON launch_status(updated_at DESC);

-- Influencer metrics tracking table
CREATE TABLE IF NOT EXISTS influencer_metrics (
  id BIGSERIAL PRIMARY KEY,
  personas JSONB NOT NULL DEFAULT '{}'::jsonb,
  opportunities JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for latest influencer metrics
CREATE INDEX IF NOT EXISTS idx_influencer_metrics_updated_at ON influencer_metrics(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies (allow read access for authenticated users)
CREATE POLICY "Allow read access to revenue" ON revenue FOR SELECT USING (true);
CREATE POLICY "Allow read access to system_health" ON system_health FOR SELECT USING (true);
CREATE POLICY "Allow read access to launch_status" ON launch_status FOR SELECT USING (true);
CREATE POLICY "Allow read access to influencer_metrics" ON influencer_metrics FOR SELECT USING (true);

-- Create policies (allow insert for service role only - sync script)
CREATE POLICY "Allow insert for service role on revenue" ON revenue FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert for service role on system_health" ON system_health FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert for service role on launch_status" ON launch_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert for service role on influencer_metrics" ON influencer_metrics FOR INSERT WITH CHECK (true);
