const https = require('https');

const SUPABASE_URL = 'ilriyvzvwarnqrbnranq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscml5dnp2d2FybnFyYm5yYW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQzNDE0MCwiZXhwIjoyMDg2MDEwMTQwfQ.4EgNkrAXjl3cnIiQgk8VPdhEXhaKN1WerHwwBG7KxKc';

const SQL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS revenue (
    id BIGSERIAL PRIMARY KEY,
    current_mrr INTEGER NOT NULL,
    products JSONB NOT NULL DEFAULT '{}'::jsonb,
    goals JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_revenue_updated_at ON revenue(updated_at DESC)`,
  `CREATE TABLE IF NOT EXISTS system_health (
    id BIGSERIAL PRIMARY KEY,
    processes JSONB NOT NULL DEFAULT '{}'::jsonb,
    integrations JSONB NOT NULL DEFAULT '{}'::jsonb,
    uptime_7d NUMERIC(5,2),
    errors_24h JSONB NOT NULL DEFAULT '{"critical": 0, "warning": 0}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_system_health_updated_at ON system_health(updated_at DESC)`,
  `CREATE TABLE IF NOT EXISTS launch_status (
    id BIGSERIAL PRIMARY KEY,
    launch_date TIMESTAMPTZ,
    countdown_hours INTEGER,
    products JSONB NOT NULL DEFAULT '{}'::jsonb,
    marketing JSONB NOT NULL DEFAULT '{}'::jsonb,
    blockers JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_launch_status_updated_at ON launch_status(updated_at DESC)`,
  `CREATE TABLE IF NOT EXISTS influencer_metrics (
    id BIGSERIAL PRIMARY KEY,
    personas JSONB NOT NULL DEFAULT '{}'::jsonb,
    opportunities JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_influencer_metrics_updated_at ON influencer_metrics(updated_at DESC)`,
  `ALTER TABLE revenue ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE system_health ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE launch_status ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE influencer_metrics ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS "Allow read access to revenue" ON revenue`,
  `DROP POLICY IF EXISTS "Allow read access to system_health" ON system_health`,
  `DROP POLICY IF EXISTS "Allow read access to launch_status" ON launch_status`,
  `DROP POLICY IF EXISTS "Allow read access to influencer_metrics" ON influencer_metrics`,
  `CREATE POLICY "Allow read access to revenue" ON revenue FOR SELECT USING (true)`,
  `CREATE POLICY "Allow read access to system_health" ON system_health FOR SELECT USING (true)`,
  `CREATE POLICY "Allow read access to launch_status" ON launch_status FOR SELECT USING (true)`,
  `CREATE POLICY "Allow read access to influencer_metrics" ON influencer_metrics FOR SELECT USING (true)`,
  `DROP POLICY IF EXISTS "Allow insert for service role on revenue" ON revenue`,
  `DROP POLICY IF EXISTS "Allow insert for service role on system_health" ON system_health`,
  `DROP POLICY IF EXISTS "Allow insert for service role on launch_status" ON launch_status`,
  `DROP POLICY IF EXISTS "Allow insert for service role on influencer_metrics" ON influencer_metrics`,
  `CREATE POLICY "Allow insert for service role on revenue" ON revenue FOR INSERT WITH CHECK (true)`,
  `CREATE POLICY "Allow insert for service role on system_health" ON system_health FOR INSERT WITH CHECK (true)`,
  `CREATE POLICY "Allow insert for service role on launch_status" ON launch_status FOR INSERT WITH CHECK (true)`,
  `CREATE POLICY "Allow insert for service role on influencer_metrics" ON influencer_metrics FOR INSERT WITH CHECK (true)`
];

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: '/rest/v1/rpc/exec',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, body });
        } else {
          resolve({ success: false, status: res.statusCode, body });
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.write(data);
    req.end();
  });
}

async function runMigration() {
  console.log('🔄 Running Supabase migration...\n');
  
  let success = 0;
  let failed = 0;
  
  for (const sql of SQL_STATEMENTS) {
    const shortSql = sql.substring(0, 60).replace(/\n/g, ' ') + '...';
    process.stdout.write(`   ${shortSql} `);
    
    try {
      const result = await executeSQL(sql);
      if (result.success || result.body.includes('already exists')) {
        console.log('✅');
        success++;
      } else {
        console.log(`❌ (${result.status})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n✨ Migration complete: ${success} successful, ${failed} failed\n`);
}

runMigration().catch(console.error);
