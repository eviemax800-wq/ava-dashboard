# 🚀 FINAL STEP: Run Database Migration

## The feature is deployed and ready! Just need to run the database migration.

### Option 1: Supabase Dashboard (Recommended - 2 minutes)

1. Go to https://supabase.com/dashboard/project/ilriyvzvwarnqrbnranq/sql/new
2. Paste this SQL and click "Run":

```sql
-- Add archive columns to proposals table
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS archived_reason TEXT;

-- Add archive columns to research table
ALTER TABLE research ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE research ADD COLUMN IF NOT EXISTS archived_reason TEXT;
```

3. You should see: "Success. No rows returned"
4. Done! ✅

### Option 2: Supabase CLI

```bash
cd /Users/evie/.openclaw/workspace/ava-dashboard
supabase link --project-ref ilriyvzvwarnqrbnranq
supabase db push
```

---

## After Migration

Visit the dashboard and test:
- https://ava-dashboard-zeta.vercel.app/dashboard/research - Click approve/reject/archive buttons
- https://ava-dashboard-zeta.vercel.app/dashboard/archive - See archived items

Everything else is already deployed! 🎉
