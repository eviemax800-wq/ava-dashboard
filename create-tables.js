const https = require('https');

const SQL = `
CREATE TABLE IF NOT EXISTS revenue (
  id BIGSERIAL PRIMARY KEY,
  current_mrr INTEGER NOT NULL,
  products JSONB NOT NULL DEFAULT '{}'::jsonb,
  goals JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenue_updated_at ON revenue(updated_at DESC);

CREATE TABLE IF NOT EXISTS system_health (
  id BIGSERIAL PRIMARY KEY,
  processes JSONB NOT NULL DEFAULT '{}'::jsonb,
  integrations JSONB NOT NULL DEFAULT '{}'::jsonb,
  uptime_7d NUMERIC(5,2),
  errors_24h JSONB NOT NULL DEFAULT '{"critical": 0, "warning": 0}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_health_updated_at ON system_health(updated_at DESC);

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

CREATE INDEX IF NOT EXISTS idx_launch_status_updated_at ON launch_status(updated_at DESC);

CREATE TABLE IF NOT EXISTS influencer_metrics (
  id BIGSERIAL PRIMARY KEY,
  personas JSONB NOT NULL DEFAULT '{}'::jsonb,
  opportunities JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_influencer_metrics_updated_at ON influencer_metrics(updated_at DESC);

ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow read access to revenue" ON revenue FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow read access to system_health" ON system_health FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow read access to launch_status" ON launch_status FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow read access to influencer_metrics" ON influencer_metrics FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow insert for service role on revenue" ON revenue FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow insert for service role on system_health" ON system_health FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow insert for service role on launch_status" ON launch_status FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow insert for service role on influencer_metrics" ON influencer_metrics FOR INSERT WITH CHECK (true);
`;

console.log('\n📋 SQL to run in Supabase Dashboard > SQL Editor:\n');
console.log('='.repeat(80));
console.log(SQL);
console.log('='.repeat(80));
console.log('\n✅ Copy the SQL above and paste it into:');
console.log('   https://supabase.com/dashboard/project/ilriyvzvwarnqrbnranq/sql/new\n');

