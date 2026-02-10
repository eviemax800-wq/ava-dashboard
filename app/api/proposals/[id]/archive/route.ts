import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { id } = await params;
    const body = await request.json();
    const reason = body.reason || null;

    const { error } = await supabase
        .from('proposals')
        .update({ 
            archived_at: new Date().toISOString(),
            archived_reason: reason
        })
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
