-- Memory Reviews table for weekly memory review system
CREATE TABLE IF NOT EXISTS memory_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_date DATE NOT NULL DEFAULT CURRENT_DATE,
    title TEXT NOT NULL,
    summary TEXT,
    changes JSONB DEFAULT '[]'::jsonb,
    pruned JSONB DEFAULT '[]'::jsonb,
    action_items JSONB DEFAULT '[]'::jsonb,
    files_reviewed TEXT[] DEFAULT '{}',
    ashan_notes TEXT,
    status TEXT DEFAULT 'ready' CHECK (status IN ('draft', 'ready', 'reviewed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    archived_at TIMESTAMPTZ,
    archived_reason TEXT
);

-- RLS
ALTER TABLE memory_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON memory_reviews
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow service role all" ON memory_reviews
    FOR ALL USING (true);
