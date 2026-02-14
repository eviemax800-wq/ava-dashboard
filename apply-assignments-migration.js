#!/usr/bin/env node

/**
 * Simple migration script to create the assigned_tasks table
 * Run with: node apply-assignments-migration.js
 */

import pg from 'pg';
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

// Supabase connection string format:
// postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
const connectionString = process.env.DATABASE_URL || 
  'postgresql://postgres.ilriyvzvwarnqrbnranq:O7wbYqjNcZgNEPMC@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres';

const { Client } = pg;

async function runMigration() {
  console.log('🚀 Running assignments migration...\n');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Read migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20260212_assigned_tasks.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Executing migration SQL...\n');
    await client.query(migrationSQL);

    console.log('✅ Migration completed successfully!\n');
    console.log('🎯 Table "assigned_tasks" is ready to use');
    console.log('💡 Start the dev server: npm run dev');
    console.log('🌐 Visit: http://localhost:3000/dashboard/assignments\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📝 Try running the SQL manually in Supabase dashboard:');
    console.log('   https://ilriyvzvwarnqrbnranq.supabase.co/project/ilriyvzvwarnqrbnranq/sql/new\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
