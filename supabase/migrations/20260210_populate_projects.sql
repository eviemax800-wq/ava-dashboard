-- ============================================================================
-- Ava Dashboard - Projects Table Population
-- Created: 2026-02-10
-- ============================================================================

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- platform, content, infrastructure
    health_score INTEGER DEFAULT 100,
    progress_percent INTEGER DEFAULT 0,
    next_milestone TEXT,
    url TEXT,
    github_repo TEXT,
    last_activity TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_last_activity ON projects (last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects (type);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow authenticated read" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow service write" ON projects FOR ALL USING (true);

-- Clear existing projects for clean slate
DELETE FROM projects;

-- ============================================================================
-- LIVE PRODUCTS
-- ============================================================================

INSERT INTO projects (name, type, health_score, progress_percent, next_milestone, url, github_repo, last_activity) VALUES
('TrustKit', 'platform', 85, 100, 'Build missing features (AI insights, analytics, widgets)', 'https://trustkit-six.vercel.app', 'https://github.com/Asdes-Group/trustkit', '2026-02-10T22:34:00Z'),

('ReviewFlow', 'platform', 100, 100, 'Merge into TrustKit as Reviews module', NULL, 'https://github.com/Asdes-Group/reviewflow', '2026-02-10T23:00:00Z'),

('Ava Dashboard', 'platform', 100, 100, 'Add projects sync automation', 'https://ava-dashboard-zeta.vercel.app', 'https://github.com/Asdes-Group/ava-dashboard', '2026-02-10T21:50:00Z'),

('Persona Studios', 'platform', 100, 100, 'Luna batch generation support', 'https://persona-studio-flax.vercel.app', 'https://github.com/Asdes-Group/persona-studios', '2026-02-08T12:00:00Z'),

('InvoiceFlow', 'platform', 100, 100, 'ProductHunt launch prep', 'https://invoiceflow-v2.vercel.app', 'https://github.com/Asdes-Group/invoiceflow', '2026-02-10T23:14:00Z'),

('TestimonialKit Lite', 'platform', 90, 100, 'Integrate with TrustKit', 'https://testimonialkit-lite.vercel.app', 'https://github.com/Asdes-Group/testimonialkit-lite', '2026-02-09T14:00:00Z');

-- ============================================================================
-- IN-FLIGHT BUILDS
-- ============================================================================

INSERT INTO projects (name, type, health_score, progress_percent, next_milestone, url, github_repo, last_activity) VALUES
('ParentSync', 'platform', 70, 80, 'Fix Supabase env vars, deploy production', NULL, 'https://github.com/Asdes-Group/parentsync', '2026-02-10T20:00:00Z');

-- ============================================================================
-- INFRASTRUCTURE
-- ============================================================================

INSERT INTO projects (name, type, health_score, progress_percent, next_milestone, url, github_repo, last_activity) VALUES
('Product Factory', 'infrastructure', 100, 100, 'Template for all new builds', NULL, 'https://github.com/Asdes-Group/product-factory-template', '2026-02-09T10:00:00Z');

-- ============================================================================
-- Summary
-- ============================================================================
-- Total Projects: 8
-- Live Products: 6 (TrustKit, ReviewFlow, Ava Dashboard, Persona Studios, InvoiceFlow, TestimonialKit Lite)
-- In-Flight Builds: 1 (ParentSync)
-- Infrastructure: 1 (Product Factory)
-- Content projects (Margot/Luna) excluded per Ashan's instruction (22:02)
