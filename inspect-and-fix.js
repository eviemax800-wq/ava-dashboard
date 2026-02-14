const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ilriyvzvwarnqrbnranq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscml5dnp2d2FybnFyYm5yYW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQzNDE0MCwiZXhwIjoyMDg2MDEwMTQwfQ.4EgNkrAXjl3cnIiQgk8VPdhEXhaKN1WerHwwBG7KxKc'
);

async function inspect() {
  console.log('🔍 Inspecting influencer_metrics table...\n');
  
  const { data, error } = await supabase.from('influencer_metrics').select('*').limit(1);
  
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Sample row:', JSON.stringify(data, null, 2));
  }
  
  console.log('\n📋 SQL needed:\n');
  console.log('-- Create only the missing tables:\n');
  console.log(`CREATE TABLE revenue (
  id BIGSERIAL PRIMARY KEY,
  current_mrr INTEGER NOT NULL,
  products JSONB NOT NULL DEFAULT '{}'::jsonb,
  goals JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE system_health (
  id BIGSERIAL PRIMARY KEY,
  processes JSONB NOT NULL DEFAULT '{}'::jsonb,
  integrations JSONB NOT NULL DEFAULT '{}'::jsonb,
  uptime_7d NUMERIC(5,2),
  errors_24h JSONB NOT NULL DEFAULT '{"critical": 0, "warning": 0}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE launch_status (
  id BIGSERIAL PRIMARY KEY,
  launch_date TIMESTAMPTZ,
  countdown_hours INTEGER,
  products JSONB NOT NULL DEFAULT '{}'::jsonb,
  marketing JSONB NOT NULL DEFAULT '{}'::jsonb,
  blockers JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_revenue_updated_at ON revenue(updated_at DESC);
CREATE INDEX idx_system_health_updated_at ON system_health(updated_at DESC);
CREATE INDEX idx_launch_status_updated_at ON launch_status(updated_at DESC);

-- Enable RLS
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_status ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "revenue_select" ON revenue FOR SELECT USING (true);
CREATE POLICY "system_health_select" ON system_health FOR SELECT USING (true);
CREATE POLICY "launch_status_select" ON launch_status FOR SELECT USING (true);

CREATE POLICY "revenue_insert" ON revenue FOR INSERT WITH CHECK (true);
CREATE POLICY "system_health_insert" ON system_health FOR INSERT WITH CHECK (true);
CREATE POLICY "launch_status_insert" ON launch_status FOR INSERT WITH CHECK (true);`);
}

inspect().catch(console.error);
