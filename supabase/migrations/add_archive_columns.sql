-- Add archive columns to proposals table
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS archived_reason TEXT;

-- Add archive columns to research table
ALTER TABLE research ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE research ADD COLUMN IF NOT EXISTS archived_reason TEXT;
