const { Client } = require('pg');

// Try direct connection to Supabase
const client = new Client({
  connectionString: 'postgresql://postgres.ilriyvzvwarnqrbnranq:Ava2024!Dashboard@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('🔄 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected!\n');
    
    const sql = `
CREATE TABLE revenue (
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

CREATE INDEX idx_revenue_updated_at ON revenue(updated_at DESC);
CREATE INDEX idx_system_health_updated_at ON system_health(updated_at DESC);
CREATE INDEX idx_launch_status_updated_at ON launch_status(updated_at DESC);

ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revenue_select" ON revenue FOR SELECT USING (true);
CREATE POLICY "system_health_select" ON system_health FOR SELECT USING (true);
CREATE POLICY "launch_status_select" ON launch_status FOR SELECT USING (true);

CREATE POLICY "revenue_insert" ON revenue FOR INSERT WITH CHECK (true);
CREATE POLICY "system_health_insert" ON system_health FOR INSERT WITH CHECK (true);
CREATE POLICY "launch_status_insert" ON launch_status FOR INSERT WITH CHECK (true);
`;

    console.log('📋 Running migration...\n');
    await client.query(sql);
    console.log('✅ Migration complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

runMigration();
