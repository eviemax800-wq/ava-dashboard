import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function runMigration() {
  const sql = readFileSync(join(__dirname, 'supabase/migrations/add_archive_columns.sql'), 'utf-8');
  
  console.log('Running migration...');
  console.log(sql);
  
  // Split by semicolons and run each statement
  const statements = sql.split(';').filter(s => s.trim());
  
  for (const statement of statements) {
    if (!statement.trim()) continue;
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        console.error('Error running statement:', statement);
        console.error(error);
      } else {
        console.log('✓ Success:', statement.substring(0, 60) + '...');
      }
    } catch (err) {
      console.error('Exception:', err);
    }
  }
  
  console.log('Migration complete!');
}

runMigration();
