#!/usr/bin/env node

/**
 * Create assigned_tasks table via Supabase JavaScript client
 * This creates the table using individual INSERT operations
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
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
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function createTable() {
  console.log('🚀 Creating assigned_tasks table...\n');

  const migrationSQL = fs.readFileSync(
    path.join(__dirname, 'supabase/migrations/20260212_assigned_tasks.sql'),
    'utf-8'
  );

  try {
    // Try to create a test record to see if table exists
    const { data: testData, error: testError } = await supabase
      .from('assigned_tasks')
      .select('id')
      .limit(1);

    if (!testError) {
      console.log('✅ Table "assigned_tasks" already exists!');
      console.log('🎯 Ready to use at /dashboard/assignments\n');
      return;
    }

    console.log('📝 Table does not exist yet.');
    console.log('📋 Please run this SQL in your Supabase dashboard:\n');
    console.log('=' .repeat(60));
    console.log(migrationSQL);
    console.log('=' .repeat(60));
    console.log('\n📍 Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/ilriyvzvwarnqrbnranq/sql/new\n');
    console.log('Or use the Supabase CLI:');
    console.log('   npx supabase link --project-ref ilriyvzvwarnqrbnranq');
    console.log('   npx supabase db push\n');

  } catch (error) {
    console.error('❌ Error checking table:', error.message);
  }
}

createTable();
