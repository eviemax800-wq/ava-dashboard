import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running assignment tasks migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20260212_assigned_tasks.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log('🔧 Executing SQL...\n');

    // Execute the entire migration as one query
    const { data, error } = await supabase.rpc('exec', { 
      query: migrationSQL
    });

    if (error) {
      console.error('⚠️  RPC method not available, trying alternative approach...\n');
      
      // Alternative: Use the SQL editor endpoint
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ query: migrationSQL })
      });

      if (!response.ok) {
        console.log('📝 Direct execution not available. Please run the migration manually:\n');
        console.log('1. Go to: https://ilriyvzvwarnqrbnranq.supabase.co/project/ilriyvzvwarnqrbnranq/sql/new');
        console.log('2. Copy the contents of: supabase/migrations/20260212_assigned_tasks.sql');
        console.log('3. Paste and run in the SQL editor\n');
        console.log('Or run: npx supabase db push (after configuring Supabase CLI)\n');
      } else {
        console.log('✅ Migration executed successfully!\n');
      }
    } else {
      console.log('✅ Migration completed successfully!\n');
    }

    console.log('🎯 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Visit: http://localhost:3000/dashboard/assignments');
    console.log('   3. Create your first assignment!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📝 Manual migration instructions:');
    console.log('   1. Open Supabase dashboard: https://ilriyvzvwarnqrbnranq.supabase.co/project/ilriyvzvwarnqrbnranq/sql/new');
    console.log('   2. Copy contents from: supabase/migrations/20260212_assigned_tasks.sql');
    console.log('   3. Paste and execute in SQL editor\n');
  }
}

runMigration();
