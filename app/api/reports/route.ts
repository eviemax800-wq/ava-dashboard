import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Serves .html reports from Supabase Storage "reports" bucket
// GET /api/reports?path=research/invoiceflow-audit.html  → redirects to public storage URL
// POST /api/reports?path=research/invoiceflow-audit.html  → uploads HTML content

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const reportPath = searchParams.get('path');

    if (!reportPath || reportPath.includes('..')) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Fetch from Supabase Storage and proxy with correct Content-Type
    // (Supabase serves .html as text/plain due to CSP sandbox)
    const storageUrl = `${supabaseUrl}/storage/v1/object/public/reports/${reportPath}`;
    const res = await fetch(storageUrl);

    if (!res.ok) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const html = await res.text();
    return new Response(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=300',
        },
    });
}

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const reportPath = searchParams.get('path');
    const authHeader = request.headers.get('authorization');

    // Require service key for uploads
    if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!reportPath || reportPath.includes('..')) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const content = await request.text();

    const { data, error } = await supabase.storage
        .from('reports')
        .upload(reportPath, content, {
            contentType: 'text/html',
            upsert: true,
        });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/reports/${reportPath}`;
    return NextResponse.json({ success: true, url: publicUrl, path: data.path });
}
