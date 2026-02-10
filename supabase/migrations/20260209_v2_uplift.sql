-- =====================================================
-- Ava Dashboard V2 Uplift Migration
-- Created: 2026-02-09
-- =====================================================

-- 1. FLUSH STALE DATA
-- Delete all tasks and re-seed from sync
DELETE FROM tasks;

-- 2. AGENT ACTIVITY TABLE (Real-time activity feed)
CREATE TABLE IF NOT EXISTS agent_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_name TEXT NOT NULL,
    agent_icon TEXT DEFAULT '🤖',
    activity_text TEXT NOT NULL,
    activity_type TEXT DEFAULT 'general', -- task_started, task_completed, research, content, system
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_agent_activity_created ON agent_activity (created_at DESC);
CREATE INDEX idx_agent_activity_agent ON agent_activity (agent_name);

-- RLS
ALTER TABLE agent_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON agent_activity FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow service write" ON agent_activity FOR ALL USING (true);

-- 3. DECISIONS TABLE (Decision Log)
CREATE TABLE IF NOT EXISTS decisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    context TEXT,
    category TEXT DEFAULT 'general', -- product_strategy, market_positioning, pricing, feature_prioritization, go_to_market
    outcome_status TEXT DEFAULT 'pending', -- validated, invalidated, pending, unknown
    learnings TEXT,
    decision_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_decisions_date ON decisions (decision_date DESC);
CREATE INDEX idx_decisions_category ON decisions (category);
CREATE INDEX idx_decisions_outcome ON decisions (outcome_status);

ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON decisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow service write" ON decisions FOR ALL USING (true);

-- 4. RESEARCH TABLE (Research & Intel)
CREATE TABLE IF NOT EXISTS research (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic TEXT NOT NULL,
    key_findings TEXT,
    full_report_url TEXT,
    tags TEXT[] DEFAULT '{}',
    source TEXT,
    researched_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_research_date ON research (researched_at DESC);
CREATE INDEX idx_research_tags ON research USING GIN (tags);

ALTER TABLE research ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON research FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow service write" ON research FOR ALL USING (true);

-- 5. COMPETITORS TABLE
CREATE TABLE IF NOT EXISTS competitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    market TEXT NOT NULL, -- invoicing, property_investment, testimonials, ai_influencers
    product_url TEXT,
    pricing TEXT,
    strengths TEXT,
    weaknesses TEXT,
    notes TEXT,
    last_updated TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_competitors_market ON competitors (market);

ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON competitors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow service write" ON competitors FOR ALL USING (true);

-- 6. INFLUENCER METRICS TABLE
CREATE TABLE IF NOT EXISTS influencer_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    handle TEXT,
    platform TEXT DEFAULT 'instagram',
    avatar_emoji TEXT DEFAULT '👤',
    followers INTEGER DEFAULT 0,
    engagement_rate NUMERIC(5,2) DEFAULT 0,
    avg_likes INTEGER DEFAULT 0,
    avg_comments INTEGER DEFAULT 0,
    weekly_content_status TEXT,
    fanvue_subscribers INTEGER DEFAULT 0,
    fanvue_mrr NUMERIC(10,2) DEFAULT 0,
    notes TEXT,
    last_updated TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE influencer_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON influencer_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow service write" ON influencer_metrics FOR ALL USING (true);

-- 7. REVENUE SUMMARY TABLE
CREATE TABLE IF NOT EXISTS revenue_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    total_mrr NUMERIC(10,2) DEFAULT 0,
    phase TEXT DEFAULT 'phase_1', -- phase_1, phase_2, phase_3, phase_4
    phase_name TEXT DEFAULT 'First Dollar',
    phase_progress_pct INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE revenue_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON revenue_summary FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow service write" ON revenue_summary FOR ALL USING (true);

-- 8. MILESTONES TABLE (Phase Progress)
CREATE TABLE IF NOT EXISTS milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phase_name TEXT NOT NULL,
    phase_number INTEGER NOT NULL,
    description TEXT,
    target TEXT, -- e.g. "First Dollar", "$1,000 MRR"
    target_date TEXT, -- e.g. "Week 1", "Month 1"
    status TEXT DEFAULT 'not_started', -- not_started, active, completed
    completion_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow service write" ON milestones FOR ALL USING (true);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Revenue Summary (honest $0)
INSERT INTO revenue_summary (total_mrr, phase, phase_name, phase_progress_pct)
VALUES (0, 'phase_1', 'First Dollar', 15);

-- Milestones
INSERT INTO milestones (phase_name, phase_number, target, target_date, status) VALUES
('First Dollar', 1, '$1', 'Week 1', 'active'),
('$1,000 MRR', 2, '$1,000 MRR', 'Month 1', 'not_started'),
('3 Businesses', 3, '3 Revenue Streams', 'Month 3', 'not_started'),
('Self-Sustaining', 4, 'Automated Revenue', 'Month 6', 'not_started');

-- Influencer Metrics
INSERT INTO influencer_metrics (name, handle, platform, avatar_emoji, followers, engagement_rate, weekly_content_status) VALUES
('Luna Rivera', '@itsluna.rivera', 'instagram', '🌙', 127, 4.2, 'Planning first batch'),
('Margot Monde', '@margot.monde', 'instagram', '💋', 89, 3.8, 'Planning first batch');

-- Competitors (seed)
INSERT INTO competitors (name, market, product_url, pricing, strengths, weaknesses) VALUES
('Freshbooks', 'invoicing', 'https://freshbooks.com', '$17-55/mo', 'Brand recognition, mature product', 'Expensive, bloated for small users'),
('Wave', 'invoicing', 'https://waveapps.com', 'Free (ad-supported)', 'Free tier, simple', 'Limited features, slow support'),
('Stripe Invoicing', 'invoicing', 'https://stripe.com/invoicing', '0.4% per invoice', 'Developer-friendly, Stripe ecosystem', 'Not standalone, needs Stripe'),
('PropertyGuru', 'property_investment', 'https://propertyguru.com.au', 'Free listings', 'Large marketplace, data', 'Not investment-focused'),
('Trustpilot', 'testimonials', 'https://trustpilot.com', '$259-1,099/mo', 'Huge brand trust, SEO juice', 'Very expensive, review gating issues'),
('AI Girlfriend Apps', 'ai_influencers', 'Various', '$10-50/mo', 'Established market, high margins', 'Ethical concerns, platform risk');

-- Agent Activity (seed recent events)
INSERT INTO agent_activity (agent_name, agent_icon, activity_text, activity_type, created_at) VALUES
('Ava', '✨', 'Dashboard V2 uplift initiated — new database schema deployed', 'system', now()),
('Antigravity', '🚀', 'Completed TrustKit 2.0 rebrand and backend integration', 'task_completed', now() - interval '2 hours'),
('Antigravity', '🚀', 'Completed WealthStack full research and GTM strategy', 'task_completed', now() - interval '4 hours'),
('Ava', '✨', 'Restructured task queue — consolidated into empire-level projects', 'system', now() - interval '6 hours'),
('Antigravity', '🚀', 'Completed TrustKit vs ReviewFlow analysis — recommending merge', 'task_completed', now() - interval '8 hours'),
('Ava', '✨', 'Morning briefing: 5 tasks completed overnight, 2 blocked on GitHub access', 'system', now() - interval '12 hours');

-- Add MRR column to existing projects table if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'mrr') THEN
        ALTER TABLE projects ADD COLUMN mrr NUMERIC(10,2) DEFAULT 0;
    END IF;
END $$;

-- Update projects with product type flag
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'is_product') THEN
        ALTER TABLE projects ADD COLUMN is_product BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Mark SaaS products
UPDATE projects SET is_product = true, mrr = 0 WHERE name IN ('InvoiceFlow', 'ReviewFlow', 'WealthStack', 'DealFlow');
