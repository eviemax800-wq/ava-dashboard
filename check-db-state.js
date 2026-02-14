const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ilriyvzvwarnqrbnranq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscml5dnp2d2FybnFyYm5yYW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQzNDE0MCwiZXhwIjoyMDg2MDEwMTQwfQ.4EgNkrAXjl3cnIiQgk8VPdhEXhaKN1WerHwwBG7KxKc'
);

async function checkDatabase() {
  console.log('🔍 Checking database state...\n');
  
  // Check if tables exist
  const tables = ['revenue', 'system_health', 'launch_status', 'influencer_metrics'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(0);
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log(`❌ ${table}: Does not exist`);
      } else {
        console.log(`⚠️  ${table}: ${error.message}`);
      }
    } else {
      console.log(`✅ ${table}: Exists`);
    }
  }
}

checkDatabase().catch(console.error);
