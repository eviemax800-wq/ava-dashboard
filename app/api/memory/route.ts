import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: files, error } = await supabase
        .from('memory_files')
        .select('*')
        .order('key');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map DB columns to the shape the frontend expects
    const mapped = (files || []).map((f) => ({
        key: f.key,
        label: f.label,
        description: f.description,
        content: f.content || '(empty)',
        lines: f.lines || 0,
        sizeBytes: f.size_bytes || 0,
        lastModified: f.last_modified || f.updated_at,
    }));

    return NextResponse.json({ files: mapped });
}

// POST: Sync memory files from local machine to Supabase
export async function POST(request: Request) {
    const supabase = createClient(supabaseUrl, serviceKey);

    const { files } = (await request.json()) as {
        files: Array<{
            key: string;
            label: string;
            description: string;
            content: string;
            lines: number;
            sizeBytes: number;
            lastModified: string | null;
        }>;
    };

    if (!files || !Array.isArray(files)) {
        return NextResponse.json({ error: 'Missing files array' }, { status: 400 });
    }

    const results = [];
    for (const file of files) {
        const { error } = await supabase
            .from('memory_files')
            .upsert({
                key: file.key,
                label: file.label,
                description: file.description,
                content: file.content,
                lines: file.lines,
                size_bytes: file.sizeBytes,
                last_modified: file.lastModified,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'key' });

        results.push({ key: file.key, success: !error, error: error?.message });
    }

    return NextResponse.json({ synced: results.length, results });
}
