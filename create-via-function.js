const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ilriyvzvwarnqrbnranq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscml5dnp2d2FybnFyYm5yYW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQzNDE0MCwiZXhwIjoyMDg2MDEwMTQwfQ.4EgNkrAXjl3cnIiQgk8VPdhEXhaKN1WerHwwBG7KxKc',
  {
    db: { schema: 'public' },
    auth: { persistSession: false }
  }
);

async function createTables() {
  console.log('🔄 Attempting to create tables via RPC...\n');
  
  // Try using rpc to execute raw SQL
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS revenue (
        id BIGSERIAL PRIMARY KEY,
        current_mrr INTEGER NOT NULL,
        products JSONB NOT NULL DEFAULT '{}'::jsonb,
        goals JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `
  });
  
  if (error) {
    console.log('❌ Error:', error.message);
    console.log('\nThe database password is needed for DDL operations.');
    console.log('This is stored in Supabase project settings, not in the codebase.');
    console.log('\nPlease run the SQL in Supabase Dashboard - it takes 10 seconds:');
    console.log('https://supabase.com/dashboard/project/ilriyvzvwarnqrbnranq/sql/new');
  } else {
    console.log('✅ Success!', data);
  }
}

createTables();
