const { Client } = require('pg');
const fs = require('fs');

// Try the pooler connection
const client = new Client({
  connectionString: 'postgresql://postgres.ilriyvzvwarnqrbnranq:Ava2024!Dashboard@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  console.log('🔄 Connecting to Supabase PostgreSQL...\n');
  
  try {
    await client.connect();
    console.log('✅ Connected!\n');
    
    const sql = fs.readFileSync('./supabase/migrations/20260214_command_center_tables.sql', 'utf-8');
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📋 Running ${statements.length} SQL statements...\n`);
    
    let success = 0;
    let skipped = 0;
    
    for (const statement of statements) {
      const preview = statement.substring(0, 60).replace(/\n/g, ' ') + '...';
      
      try {
        await client.query(statement);
        console.log(`✅ ${preview}`);
        success++;
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  ${preview} (already exists)`);
          skipped++;
        } else {
          console.log(`❌ ${preview}`);
          console.log(`   Error: ${error.message}`);
        }
      }
    }
    
    console.log(`\n✨ Migration complete!`);
    console.log(`   Success: ${success}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${success + skipped}\n`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
