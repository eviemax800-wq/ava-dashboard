-- Memory files table: stores the content of Ava's memory files for remote access
CREATE TABLE IF NOT EXISTS memory_files (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    lines INTEGER NOT NULL DEFAULT 0,
    size_bytes INTEGER NOT NULL DEFAULT 0,
    last_modified TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE memory_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON memory_files
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow service role all" ON memory_files
    FOR ALL TO service_role USING (true) WITH CHECK (true);
