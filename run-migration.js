#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://ilriyvzvwarnqrbnranq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscml5dnp2d2FybnFyYm5yYW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQzNDE0MCwiZXhwIjoyMDg2MDEwMTQwfQ.4EgNkrAXjl3cnIiQgk8VPdhEXhaKN1WerHwwBG7KxKc'
);

async function createTables() {
  console.log('Creating Command Center tables...\n');
  
  // Create each table individually
  const tables = [
    {
      name: 'revenue',
      sql: `CREATE TABLE IF NOT EXISTS revenue (
        id BIGSERIAL PRIMARY KEY,
        current_mrr INTEGER NOT NULL,
        products JSONB NOT NULL DEFAULT '{}'::jsonb,
        goals JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`
    },
    {
      name: 'system_health',
      sql: `CREATE TABLE IF NOT EXISTS system_health (
        id BIGSERIAL PRIMARY KEY,
        processes JSONB NOT NULL DEFAULT '{}'::jsonb,
        integrations JSONB NOT NULL DEFAULT '{}'::jsonb,
        uptime_7d NUMERIC(5,2),
        errors_24h JSONB NOT NULL DEFAULT '{"critical": 0, "warning": 0}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`
    },
    {
      name: 'launch_status',
      sql: `CREATE TABLE IF NOT EXISTS launch_status (
        id BIGSERIAL PRIMARY KEY,
        launch_date TIMESTAMPTZ,
        countdown_hours INTEGER,
        products JSONB NOT NULL DEFAULT '{}'::jsonb,
        marketing JSONB NOT NULL DEFAULT '{}'::jsonb,
        blockers JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`
    },
    {
      name: 'influencer_metrics',
      sql: `CREATE TABLE IF NOT EXISTS influencer_metrics (
        id BIGSERIAL PRIMARY KEY,
        personas JSONB NOT NULL DEFAULT '{}'::jsonb,
        opportunities JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`
    }
  ];
  
  console.log('⚠️  Note: Supabase client cannot execute DDL directly.');
  console.log('Please run this SQL in Supabase Dashboard > SQL Editor:\n');
  console.log('---');
  console.log(fs.readFileSync('./supabase/migrations/20260214_command_center_tables.sql', 'utf-8'));
  console.log('---');
}

createTables();
